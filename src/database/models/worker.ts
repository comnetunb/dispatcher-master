import { model, Schema, Document, Model, DocumentQuery } from 'mongoose';
import Task from './task';
import { WorkerState } from 'dispatcher-protocol';

interface IWorkerDocument extends Document {
  address: string,
  port: number,
  uuid: string,
  runningInstances: number,
  state: WorkerState,
  resource: {
    outdated?: boolean,
    cpu?: number,
    memory?: number,
  },
  performance: {
    ratio?: number,
    level?: string,
  },
  alias?: string,
}

export interface IWorker extends IWorkerDocument {
  updateRunningInstances(): Promise<IWorker>,
}

interface IWorkerModel extends Model<IWorker> {
  getAvailables(cpuThreshold: number, memoryThreshold: number): Promise<IWorker[]>,
}

const workerSchema: Schema = new Schema({
  address: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    required: true
  },
  // Internal id
  uuid: {
    type: String,
    required: true
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
  alias: {
    type: String
  }
});

workerSchema.statics.getAvailables = async function (cpuThreshold: number, memoryThreshold: number): Promise<IWorker[]> {
  const filter = {
    'resource.outdated': false,
    'resource.cpu': { $lt: cpuThreshold },
    'resource.memory': { $lt: memoryThreshold },
    'state': WorkerState.Executing,
  };
  const worker: IWorkerModel = this;
  const availableWorkers = await worker.find(filter);
  return availableWorkers;
};

workerSchema.methods.updateRunningInstances = async function (): Promise<IWorker> {
  const worker: IWorker = this;
  const count = await Task.count({ worker: worker.uuid });
  worker.runningInstances = count;
  return await worker.save();
};

workerSchema.index({ address: 1, port: 1 }, { unique: true });

export const Worker: IWorkerModel = model<IWorker, IWorkerModel>('Worker', workerSchema);

export default Worker;
