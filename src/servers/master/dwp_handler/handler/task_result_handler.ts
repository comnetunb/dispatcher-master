import Task from "../../../../database/models/task";
import TaskSet, { ITaskSet } from "../../../../database/models/taskSet";
import Notification from "../../../../database/models/notification";
import * as mailer from "../../../shared/mailer";
import logger from "../../../shared/log";
import { TaskResult, ReturnCode } from "dispatcher-protocol";
import { IWorker } from "../../../../database/models/worker";
import { OperationState } from "../../../../api/enums";

export async function execute(pdu: TaskResult, worker: IWorker): Promise<void> {
  if (pdu.code === ReturnCode.Success) {
    const parseNormal = tryParseJson(pdu.output);

    const possibleHeader = "Academic license - for non-commercial use only";
    const stripped = pdu.output
      ? pdu.output.replace(possibleHeader, "").trim()
      : null;
    const parseStripped = tryParseJson(stripped);

    if (parseNormal.error && parseStripped.error) {
      pdu.output = `${parseNormal.error}\nJSON: ${pdu.output}`;
      pdu.code = ReturnCode.Error;
    } else if (parseNormal.error) {
      pdu.output = stripped;
    }
  }

  if (pdu.code === ReturnCode.Success) {
    const unset: true = true;
    const taskUpdate = {
      result: pdu.output,
      state: OperationState.Finished,
      endTime: new Date(),
      $unset: { worker: unset },
    };

    try {
      const task = await Task.findByIdAndUpdate(pdu.task.id, taskUpdate, {
        new: true,
      });
      if (!task) {
        logger.warn(`Finished task does not exist anymore`, pdu.task.id);
        await worker.updateRunningInstances();
        return;
      }

      logger.info(
        `Worker ${worker.status.remoteAddress} has finished task with precedence ${task.precedence} (${task._id})`,
        pdu.task.id
      );

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
        throw "Task not found";
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
}

async function cascadeConclusion(tasksetId: ITaskSet): Promise<void> {
  const taskFilter = {
    _taskSet: tasksetId,
    $or: [
      { state: OperationState.Pending },
      { state: OperationState.Sent },
      { state: OperationState.Executing },
    ],
  };

  const activeCount = await Task.countDocuments(taskFilter);
  if (activeCount > 0) {
    return;
  }

  // All tasks are done. Finish TaskSet
  const taskSetUpdate = {
    state: OperationState.Finished,
    endTime: new Date(),
  };

  const taskSet = await TaskSet.findOneAndUpdate(
    { _id: tasksetId, state: OperationState.Executing },
    taskSetUpdate,
    { new: true }
  ).populate("_user");

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
    $or: [{ state: OperationState.Canceled }, { state: OperationState.Failed }],
  };

  const failedCount = await Task.countDocuments(taskFilter);
  let result = "Success";
  if (failedCount > 0) {
    result = "Warning";
  }

  const notification = new Notification({
    result,
    title: `Task set "${taskSet.name}" has finished`,
    message: `Result: ${result}`,
    userId: taskSet._user,
    tasksetId: taskSet._id,
  });

  await notification.save();
}

async function dateString(milliseconds: number) {
  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;

  const days = Math.floor(milliseconds / day);
  milliseconds = milliseconds % day;
  const hours = Math.floor(milliseconds / hour);
  milliseconds = milliseconds % hour;
  const minutes = Math.floor(milliseconds / minute);
  milliseconds = milliseconds % minute;
  const seconds = Math.floor(milliseconds / second);

  const values = [];
  if (days > 0) {
    values.push([days, days == 1 ? "day" : "days"]);
  }
  if (hours > 0) {
    values.push([hours, hours == 1 ? "hour" : "hours"]);
  }
  if (minutes > 0) {
    values.push([minutes, minutes == 1 ? "minute" : "minutes"]);
  }
  if (seconds > 0) {
    values.push([seconds, seconds == 1 ? "second" : "seconds"]);
  }

  let value = "";
  for (let i = 0; i < values.length; i++) {
    let cur = `${values[i][0]} ${values[i][1]}`;

    if (i != 0 && i == values.length - 1) value += " and ";
    else if (i != 0) value += ", ";

    value += cur;
  }

  return value;
}

async function sendConclusionEmail(taskSet: ITaskSet): Promise<void> {
  const to = taskSet._user.email;
  const subject = `Task set "${taskSet.name}" has finished`;
  const difference = Math.abs(
    taskSet.startTime.getTime() - taskSet.endTime.getTime()
  );

  const finishedTasks = await Task.countDocuments({
    _taskSet: taskSet._id,
    state: OperationState.Finished,
  });
  const failedTasks = await Task.countDocuments({
    _taskSet: taskSet._id,
    state: OperationState.Failed,
  });
  const canceledTasks = await Task.countDocuments({
    _taskSet: taskSet._id,
    state: OperationState.Canceled,
  });
  const duration = await dateString(difference);

  // TODO: use template email
  const text = `
The task set ${taskSet.name} has finished after ${duration}.

Taskset description: ${taskSet.description}

Argument template string: ${taskSet.argumentTemplate}

Start time: ${taskSet.startTime}
End time: ${taskSet.endTime}
Duration: ${duration}
Priority: ${taskSet.priority}

Total tasks: ${taskSet.totalTasksCount}
Finished tasks: ${finishedTasks}
Failed tasks: ${failedTasks}
Canceled tasks: ${canceledTasks}`;

  await mailer.sendMail(to, subject, text);
}

function tryParseJson(input: string): { result: object; error: any } {
  try {
    const result = JSON.parse(input);
    return {
      result: result,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      error: error,
    };
  }
}
