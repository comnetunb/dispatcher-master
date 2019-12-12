import { model, Schema, Document, Model, DocumentQuery } from 'mongoose';
import Task from './task';
import { WorkerState } from 'dispatcher-protocol';
import { hashSync, compareSync } from 'bcryptjs';

interface IWorkerDocument extends Document {
  _id: string,
  password: string,
  name: string,
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
  remotePort?: number;
}

export interface IWorker extends IWorkerDocument {
  updateRunningInstances(): Promise<IWorker>,
  validPassword(password: string): boolean,
}

interface IWorkerModel extends Model<IWorker> {
  getAvailables(cpuThreshold: number, memoryThreshold: number): Promise<IWorker[]>,
  encryptPassword(password: string): string,
}

const workerStatusSchema: Schema = new Schema({
  online: {
    type: Boolean,
    default: false,
  },
  remoteAddress: {
    type: String,
  },
  remotePort: {
    type: Number,
  },
});

const workerSchema: Schema = new Schema({
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: workerStatusSchema,
    default: false,
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
  const count = await Task.count({ worker: worker._id });
  worker.runningInstances = count;
  return await worker.save();
};

workerSchema.index({ address: 1, port: 1 }, { unique: true });

export const Worker: IWorkerModel = model<IWorker, IWorkerModel>('Worker', workerSchema);

export default Worker;
