import logger from '../../shared/log';
import * as net from 'net';
import * as performTaskResponseHandler from './handler/perform_task_response_handler';
import * as reportHandler from './handler/report_handler';
import * as terminateTaskResponseHandler from './handler/terminate_task_response_handler';
import * as taskResultHandler from './handler/task_result_handler';
import * as languageHandler from './handler/language_handler';
import Worker, { IWorker } from '../../../database/models/worker';
import { ProtocolType, PDU, Report, PerformTaskResponse, TaskResult, TerminateTaskResponse, GetLanguageCommand } from 'dispatcher-protocol';

export async function treat(packet: string, socket: net.Socket): Promise<void> {
  const filter = { address: socket.remoteAddress, port: socket.remotePort };
  let pdu: PDU;

  try {
    pdu = JSON.parse(packet.toString());
  } catch (e) {
    logger.fatal(e);
    return;
  }

  const worker = await Worker.findOne(filter);
  if (!worker) {
    throw String('Worker not found');
  }

  chooseHandler(pdu, worker);
};

function chooseHandler(pdu: PDU, worker: IWorker): void {
  switch (pdu.data.type) {
    case ProtocolType.Report:
      reportHandler.execute(pdu.data as Report, worker);
      break;

    case ProtocolType.PerformTaskResponse:
      performTaskResponseHandler.execute(pdu.data as PerformTaskResponse, worker);
      break;

    case ProtocolType.TaskResult:
      taskResultHandler.execute(pdu.data as TaskResult, worker);
      break;

    case ProtocolType.TerminateTaskResponse:
      terminateTaskResponseHandler.execute(pdu.data as TerminateTaskResponse, worker);
      break;

    case ProtocolType.GetLanguageCommand:
      languageHandler.getCommands(pdu.data as GetLanguageCommand, worker);
      break;

    default:
  }
}
