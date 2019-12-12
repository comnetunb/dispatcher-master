import io from 'socket.io';
import Configuration, { IConfiguration } from '../../database/models/configuration';
import _ from 'lodash';
import logger from '../shared/log';
import Worker, { IWorker } from '../../database/models/worker';
import Task from '../../database/models/task';

// Extending socket.io to properly type our workers and authentication
declare module 'socket.io' {
  interface Socket {
    auth: boolean,
    worker: IWorker,
  }
}

export async function socketIOAuth(server: io.Server, postAuthenticate: (socket: io.Socket, data: any) => any) {
  let config = await Configuration.get();
  var timeout = config.authTimeout;

  _.each(server.nsps, forbidConnections);
  server.on('connection', async (socket) => {
    socket.auth = false;
    socket.on('authentication', async (data) => {
      const success = await authenticate(socket, data);
      if (success) {

        logger.debug(`Authenticated socket ${socket.id}, worker ${socket.worker._id} ${socket.worker.name}`);
        _.each(server.nsps, function (nsp) {
          restoreConnection(nsp, socket);
        });

        socket.emit('authenticated');
        return postAuthenticate(socket, data);
      } else {
        logger.debug(`Authentication failure socket ${socket.id}`);
        socket.emit('unauthorized', { message: 'Authentication failure' });
        socket.disconnect(true);
      }
    });

    socket.on('disconnect', async () => {
      return disconnect(socket);
    });

    setTimeout(async () => {
      // If the socket didn't authenticate after connection, disconnect it
      if (!socket.auth) {
        logger.debug(`Socket ${socket.id} has not authenticated in 10 seconds, disconnecting it...`);
        socket.disconnect(true);
      }
    }, timeout);
  });
};

const authenticate = async (socket: io.Socket, data: any): Promise<boolean> => {
  try {
    const { workerId, password } = data;
    const worker = await Worker.findById(workerId);
    if (!worker || !worker.validPassword(password)) {
      return false;
    }

    worker.status.online = true;
    worker.status.remoteAddress = socket.conn.remoteAddress;

    socket.auth = true;
    socket.worker = worker;

    return true;
  } catch (err) {
    return false;
  }
}

const disconnect = async (socket: io.Socket) => {
  logger.debug(`Socket ${socket.id} disconnected.`);
  if (!socket.worker) return;

  try {
    socket.worker.status.online = false;
    socket.worker.status.remoteAddress = null;
    await socket.worker.save();
    logger.debug(`Worker ${socket.worker.name} is now offline.`);

    const taskFilter = { worker: socket.worker._id };

    const tasks = await Task.find(taskFilter);

    if (tasks.length > 0) {
      logger.debug(`Clearing tasks from worker ${socket.worker.name}.`);

      tasks.map((task) => {
        return task.updateToDefaultState();
      });

    }
  } catch (err) {
    logger.fatal(err);
  }
}

const forbidConnections = async (nsp: io.Namespace) => {
  nsp.on('connect', async (socket) => {
    if (!socket.auth) {
      logger.debug(`removing socket from ${nsp.name}`);
      delete nsp.connected[socket.id];
    }
  });
}

/**
 * If the socket attempted a connection before authentication, restore it.
 */
const restoreConnection = async (nsp: io.Namespace, socket: io.Socket) => {
  if (_.find(nsp.sockets, { id: socket.id })) {
    logger.debug(`restoring socket to ${nsp.name}`);
    nsp.connected[socket.id] = socket;
  }
}
