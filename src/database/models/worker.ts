import { model, Schema, Document, Model, DocumentQuery, mongo } from 'mongoose';
import Task from './task';
import { WorkerState } from 'dispatcher-protocol';
import { hashSync, compareSync } from 'bcryptjs';

interface IWorkerDocument extends Document {
  password: string,
  name: string,
  description: string,
  runningInstances: number,
  state: WorkerState,
  status: WorkerStatus,
  resource: {
    outdated?: boolean,
    cpu?: number,
    memory?: number,
  },
  performance: {
    ratio?: number,
    level?: string,
  },
}

export interface WorkerStatus {
  online: boolean;
  remoteAddress?: string;
  connectionId?: string;
}

export interface IWorker extends IWorkerDocument {
  updateRunningInstances(): Promise<IWorker>,
  validPassword(password: string): boolean,
}

interface IWorkerModel extends Model<IWorker> {
  getAvailables(cpuThreshold: number, memoryThreshold: number): Promise<IWorker[]>,
  resetAllConnections(): Promise<void>,
  encryptPassword(password: string): string,
}

const workerSchema: Schema = new Schema({
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    online: {
      type: Boolean,
      default: false,
    },
    remoteAddress: {
      type: String,
    },
    connectionId: {
      type: String,
    },
  },
  runningInstances: {
    type: Number,
    default: 0
  },
  state: {
    type: Number,
  },
  resource: {
    outdated: {
      type: Boolean,
      default: true
    },
    cpu: Number,
    memory: Number
  },
  performance: {
    ratio: Number,
    level: {
      type: String,
      default: 'Undefined'
    }
  },
});

const saltRounds = 10;

workerSchema.statics.resetAllConnections = async (): Promise<void> => {
  await Worker.updateMany({}, { $set: { status: { online: false, remoteAddress: null, connectionId: null } } });
};

workerSchema.statics.encryptPassword = (password: string): string => {
  return hashSync(password, saltRounds);
};

workerSchema.methods.validPassword = function (password: string): boolean { // eslint-disable-line func-names
  return compareSync(password, this.password);
};

workerSchema.statics.getAvailables = async function (cpuThreshold: number, memoryThreshold: number): Promise<IWorker[]> {
  const filter = {
    'resource.outdated': false,
    'resource.cpu': { $lt: cpuThreshold },
    'resource.memory': { $lt: memoryThreshold },
    'state': WorkerState.Executing,
    'status.online': true,
  };
  const worker: IWorkerModel = this;
  const availableWorkers = await worker.find(filter);
  return availableWorkers;
};

workerSchema.methods.updateRunningInstances = async function (): Promise<IWorker> {
  const worker: IWorker = this;
  const count = await Task.countDocuments({ worker: worker._id });
  worker.runningInstances = count;
  return await worker.save();
};

workerSchema.index({ address: 1, port: 1 }, { unique: true });

export const Worker: IWorkerModel = model<IWorker, IWorkerModel>('Worker', workerSchema);

export default Worker;
