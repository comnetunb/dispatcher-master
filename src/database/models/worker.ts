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
  resourceLimit: {
    cpu?: number,
    memory?: number,
  }
  performance: {
    ratio?: number,
    level?: string,
  },
  available?: boolean,
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
      index: true,
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
    index: true,
  },
  resource: {
    outdated: {
      type: Boolean,
      default: true
    },
    cpu: {
      type: Number,
      index: true,
    },
    memory: {
      type: Number,
      index: true,
    }
  },
  resourceLimit: {
    cpu: {
      type: Number,
      index: true,
    },
    memory: {
      type: Number,
      index: true,
    }
  },
  performance: {
    ratio: Number,
    level: {
      type: String,
      default: 'Undefined'
    }
  },
  // Not used, just a hack
  available: {
    type: Boolean,
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
    'state': 0,
    'status.online': true,
    $and: [
      {
        $or: [
          {
            // if custom limit is set, use it, default otherwise
            'resourceLimit.cpu': { $ne: null },
            $expr: { $lt: ["$resource.cpu", "$resourceLimit.cpu"] }
          },
          {
            'resourceLimit.cpu': null,
            'resource.cpu': { $lt: 1 }
          },
        ]
      },
      {
        $or: [
          {
            'resourceLimit.memory': { $ne: null },
            $expr: { $lt: ["$resource.memory", "$resourceLimit.memory"] }
          },
          {
            'resourceLimit.memory': null,
            'resource.memory': { $lt: 1 }
          },
        ]
      },
    ]
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

export const Worker: IWorkerModel = model<IWorker, IWorkerModel>('Worker', workerSchema);

export default Worker;
