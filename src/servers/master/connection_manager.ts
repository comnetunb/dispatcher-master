import { findSocket } from "./communication";
import Worker, { IWorker } from "../../database/models/worker";
import {
  PDU,
  CommandData,
  PDUHeader,
  ProtocolVersion,
} from "dispatcher-protocol";

export async function getAll(): Promise<IWorker[]> {
  return await Worker.find({
    "status.online": true,
  });
}

export async function send(worker: IWorker, data: CommandData): Promise<void> {
  return new Promise((resolve, reject) => {
    findSocket(worker)
      .then((socket) => {
        if (socket === null) {
          return reject("Connection not found");
        }

        let header: PDUHeader = {
          ts: new Date(),
          v: ProtocolVersion,
        };

        let packet: PDU = {
          header,
          data,
        };

        socket.emit("data", packet);
        resolve();
      })
      .catch((e) => reject(e));
  });
}
