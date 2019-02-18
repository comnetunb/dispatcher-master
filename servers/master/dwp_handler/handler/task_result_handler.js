
const dispatcherProtocol = require('dispatcher-protocol');

const { taskResult } = dispatcherProtocol.pdu;

// Database Related
const Task = rootRequire('database/models/task');
const TaskSet = rootRequire('database/models/task_set');

// Shared Related
const mailer = rootRequire('servers/shared/mailer');
const log = rootRequire('servers/shared/log');

module.exports.execute = (pdu, worker) => {
  if (pdu.code === taskResult.ReturnCode.SUCCESS) {
    // Succeded
    try {
      JSON.parse(pdu.output);
    } catch (e) {
      log.fatal(`${e}\nJSON: ${pdu.output}`, pdu.task.id);
    }

    const taskUpdate = {
      result: pdu.output,
      state: Task.State.FINISHED,
      endTime: new Date(),
      $unset: { worker: 1 }
    };

    Task
      .findByIdAndUpdate(pdu.task.id, taskUpdate, { new: true })
      .then((task) => {
        log.info(`Worker ${worker.address}:${worker.port} has finished task with precedence ${task.precedence} (${task._id})`, pdu.task.id);

        TaskSet.UpdateRemainingTasksCount(task._taskSet);

        return cascadeConclusion(task._taskSet);
      })
      .then(() => {
        return worker.updateRunningInstances();
      })
      .catch((e) => {
        log.fatal(e, pdu.task.id);
      });
  } else {
    // Failed
    log.warn(`${pdu.task.id} failed to execute: ${pdu.output}`, pdu.task.id);

    Task
      .flagError(pdu.task.id)
      .then(() => {
        return worker.updateRunningInstances();
      })
      .catch((e) => {
        log.fatal(e, pdu.task.id);
      });
  }
};

function cascadeConclusion(taskSetId) {
  const taskFilter = {
    _taskSet: taskSetId,
    state: {
      $ne: Task.State.FINISHED
    }
  };

  return Task
    .count(taskFilter)
    .then((activeCount) => {
      if (activeCount > 0) {
        return;
      }

      // All tasks are done. Finish TaskSet
      const taskSetUpdate = {
        state: TaskSet.State.FINISHED,
        endTime: Date.now()
      };

      TaskSet
        .findByIdAndUpdate(taskSetId, taskSetUpdate, { new: true })
        .populate('_user')
        .then((taskSet) => {
          sendConclusionEmail(taskSet);
        });
    });
}

function sendConclusionEmail(taskSet) {
  const to = taskSet._user.email;
  const subject = `Task set "${taskSet.name}" has finished`;

  // TODO: use template email
  const text =
    `Start time: ${taskSet.startTime}` +
    `\nEnd time: ${taskSet.endTime}` +
    `\nPriority: ${taskSet.priority}`;

  mailer.sendMail(to, subject, text);
}
