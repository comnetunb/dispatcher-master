import * as connectionManager from "../../connection_manager";
import logger from "../../../shared/log";
import Task from "../../../../database/models/task";
import Worker, { IWorker } from "../../../../database/models/worker";
import {
  Report,
  TerminateTask,
  ProtocolType,
  TaskInfo,
} from "dispatcher-protocol";

export function execute(pdu: Report, worker: IWorker): void {
  if (pdu.resources) {
    worker.resource.outdated = false;
    worker.resource.cpu = pdu.resources.cpu;
    worker.resource.memory = pdu.resources.memory;
  }

  if (pdu.tasks) {
    const tasks = pdu.tasks.tasks;
    Promise.all(
      tasks.map(async (taskReceived: TaskInfo) => {
        // Go through all tasks
        try {
          const task = await Task.findById(taskReceived.id);
          if (!task) {
            return;
          }

          const possibleResponse: TerminateTask = {
            type: ProtocolType.TerminateTask,
            taskId: task.id,
          };

          if (task.isFinished() || task.isCanceled()) {
            // It was canceled or finished. Terminate it
            await connectionManager.send(worker, possibleResponse);
            return;
          }

          if (task.worker) {
            // There is a worker executing this instance already
            if (task.startTime < taskReceived.startTime) {
              // Evaluating by the time they started, the 'older' worker will finish faster
              await connectionManager.send(worker, possibleResponse); // eslint-disable-line
              return;
            }

            // Evaluating by the time they started, the 'newer' worker will finish faster
            const taskWorker = await Worker.findById(task.worker);
            await connectionManager.send(taskWorker, possibleResponse);
          }

          // Associate this instance to this worker
          task.worker = worker._id;
          task.save();
        } catch (err) {
          logger.error(
            `Could not check data of task ${taskReceived.id} and worker ${worker._id}`
          );
        }
      })
    )
      .then(() => {
        const taskFilter = { worker: worker._id };

        return Task.find(taskFilter).then((tasks) => {
          if (!tasks) {
            return;
          }

          Promise.all(
            tasks.map((task) => {
              for (const taskReceived in pdu.tasks) {
                // eslint-disable-line
                if (pdu.tasks[taskReceived].id === task._id) {
                  return;
                }
              }
              return task.updateToDefaultState();
            })
          );
        });
      })
      .then(() => {
        worker.updateRunningInstances();
      })
      .catch((error) => {
        logger.fatal(error);
      });
  }

  if (pdu.state) {
    worker.state = pdu.state.state;
  }

  if (pdu.alias) {
    // worker.name = pdu.alias;
  }

  worker.save().catch((e) => {
    logger.fatal(e);
  });
}
