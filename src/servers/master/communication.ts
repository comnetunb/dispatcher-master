import * as net from "net";
import _ from "lodash";
import EventEmitter from "events";
import * as connectionManager from "./connection_manager";
import * as dwpManager from "./dwp_handler/manager";
import logger from "../shared/log";
import { GetReport, ProtocolType, PDU } from "dispatcher-protocol";
import http from "http";
import io from "socket.io";
import { socketIOAuth } from "./authentication";
import Worker, { IWorker } from "../../database/models/worker";
import Task from "../../database/models/task";

const httpServer = http.createServer();
const server = io(httpServer);

export const event = new EventEmitter();

const postAuthenticate = (socket: io.Socket, data: any) => {
  // Ask everything
  const getReport: GetReport = {
    type: ProtocolType.GetReport,
    alias: true,
    resources: true,
    tasks: true,
    state: true,
    supportedLanguages: true,
  };

  connectionManager.send(socket.worker, getReport);

  socket.on("data", (data: PDU): void => {
    try {
      dwpManager.treat(data, socket);
    } catch (e) {
      logger.error(data);
      // It is normal to end up here
      // Do not treat exception!
    }
  });
};

export async function execute(): Promise<void> {
  await Worker.resetAllConnections();

  socketIOAuth(server, postAuthenticate, disconnect);
  // Open worker
  httpServer.listen(16180, "0.0.0.0", () => {
    let addressInfo = httpServer.address() as net.AddressInfo;
    if (addressInfo.port) {
      logger.info(
        `TCP server listening on ${addressInfo.address}:${addressInfo.port}`
      );
    } else {
      logger.info(`TCP server listening on ${httpServer.address() as string}`);
    }
  });
}

export async function findSocket(worker: IWorker): Promise<io.Socket> {
  let connectionId: string = worker.status.connectionId;

  let socket: io.Socket = server.nsps["/"].connected[connectionId] || null;

  if (!socket) {
    await disconnectWorker(worker);
  }

  return socket;
}

const disconnect = async (socket: io.Socket) => {
  logger.debug(`Socket ${socket.id} disconnected.`);
  await disconnectWorker(socket.worker);
};

const disconnectWorker = async (worker: IWorker) => {
  if (!worker) return;

  try {
    worker.status.online = false;
    worker.status.remoteAddress = null;
    worker.status.connectionId = null;
    await worker.save();

    logger.debug(`Worker ${worker.name} is now offline.`);

    const taskFilter = { worker: worker._id };

    const tasks = await Task.find(taskFilter);

    if (tasks.length > 0) {
      logger.debug(`Clearing tasks from worker ${worker.name}.`);

      tasks.map((task) => {
        return task.updateToDefaultState();
      });
    }
  } catch (err) {
    logger.fatal(
      `Could not properly update status of worker ${worker.name}: ${err}`
    );
  }
};
