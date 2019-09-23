import Task from '../../../../database/models/task';
import TaskSet, { ITaskSet } from '../../../../database/models/taskSet';
import Notification from '../../../../database/models/notification';
import * as mailer from '../../../shared/mailer';
import logger from '../../../shared/log';
import { TaskResult, ReturnCode } from 'dispatcher-protocol';
import { IWorker } from '../../../../database/models/worker';
import { OperationState, Result } from '../../../../database/enums';

export async function execute(pdu: TaskResult, worker: IWorker): Promise<void> {
  if (pdu.code === ReturnCode.Success) {
    try {
      JSON.parse(pdu.output);
    } catch (error) {
      pdu.output = `${error}\nJSON: ${pdu.output}`;
      pdu.code = ReturnCode.Error;
    }
  }

  if (pdu.code === ReturnCode.Success) {
    const taskUpdate = {
      result: pdu.output,
      state: OperationState.Finished,
      endTime: new Date(),
      $unset: { worker: 1 }
    };

    try {
      const task = await Task.findByIdAndUpdate(pdu.task.id, taskUpdate, { new: true });
      logger.info(`Worker ${worker.address}:${worker.port} has finished task with precedence ${task.precedence} (${task._id})`, pdu.task.id);

      const taskSet = await TaskSet.findById(task._taskSet);
      await taskSet.updateRemainingTasksCount();

      await cascadeConclusion(taskSet);
      await worker.updateRunningInstances();
    } catch (error) {
      logger.error(error);
    }
  } else {
    logger.warn(`${pdu.task.id} failed to execute: ${pdu.output}`, pdu.task.id);

    try {
      const task = await Task.findById(pdu.task.id);
      if (!task) {
        throw 'Task not found';
      }

      await task.flagError();
      const taskSet = await TaskSet.findById(task._taskSet);
      await taskSet.updateRemainingTasksCount();
      await worker.updateRunningInstances();
      await cascadeConclusion(taskSet);
    } catch (error) {
      logger.error(error);
    }
  }
};

async function cascadeConclusion(taskSetId: ITaskSet): Promise<void> {
  const taskFilter = {
    _taskSet: taskSetId,
    $or: [
      { state: OperationState.Pending },
      { state: OperationState.Sent },
      { state: OperationState.Executing }
    ],
  };

  const activeCount = await Task.count(taskFilter);
  if (activeCount > 0) {
    return;
  }

  // All tasks are done. Finish TaskSet
  const taskSetUpdate = {
    state: OperationState.Finished,
    endTime: Date.now()
  };

  const taskSet = await TaskSet
    .findOneAndUpdate({ _id: taskSetId, state: OperationState.Executing }, taskSetUpdate, { new: true })
    .populate('_user');

  if (taskSet) {
    await sendConclusionNotification(taskSet);
    await sendConclusionEmail(taskSet);
  }
}

async function sendConclusionNotification(taskSet: ITaskSet): Promise<void> {
  if (taskSet.state !== OperationState.Finished) {
    return;
  }

  const taskFilter = {
    _taskSet: taskSet._id,
    $or: [
      { state: OperationState.Canceled },
      { state: OperationState.Failed }
    ],
  };

  const failedCount = await Task.count(taskFilter);
  let result = Result.Success;
  if (failedCount > 0) {
    result = Result.Warning;
  }

  const notification = new Notification({
    result,
    title: `Task set "${taskSet.name}" has finished`,
    message: `Result: ${result}`,
    userId: taskSet._user,
    taskSetId: taskSet._id,
  });

  await notification.save();
}

async function sendConclusionEmail(taskSet: ITaskSet): Promise<void> {
  const to = taskSet._user.email;
  const subject = `Task set "${taskSet.name}" has finished`;

  // TODO: use template email
  const text =
    `Start time: ${taskSet.startTime}` +
    `\nEnd time: ${taskSet.endTime}` +
    `\nPriority: ${taskSet.priority}`;

  await mailer.sendMail(to, subject, text);
}
