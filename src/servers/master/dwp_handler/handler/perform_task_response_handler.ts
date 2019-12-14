import logger from '../../../shared/log';
import * as connectionManager from '../../connection_manager';
import Task from '../../../../database/models/task';
import { PerformTaskResponse, ReturnCode, TerminateTask, ProtocolType, EncapsulatePDU } from 'dispatcher-protocol';
import { IWorker } from '../../../../database/models/worker';
import { OperationState } from '../../../../api/enums';

export async function execute(pdu: PerformTaskResponse, worker: IWorker): Promise<void> {
  if (pdu.code === ReturnCode.Executing) {
    try {
      const task = await Task.findById(pdu.task.id);
      if (!task) {
        throw String('Task not found');
      }


      if (task.worker !== worker._id) {
        const response: TerminateTask = {
          type: ProtocolType.TerminateTask,
          taskId: task.id,
        }
        // There is already a worker executing it
        connectionManager.send(worker._id, response);
        return;
      }

      task.worker = worker._id;
      task.state = OperationState.Executing;
      await task.save();
      await worker.updateRunningInstances();
    } catch (error) {
      logger.fatal(error, pdu.task.id);
    };
  } else if (pdu.code === ReturnCode.Denied) {
    logger.warn(`Task was denied by worker ${worker.status.remoteAddress}`, pdu.task.id);
  } else {
    logger.fatal(`Unknown return code ${pdu.code}`, pdu.task.id);
  }
};
