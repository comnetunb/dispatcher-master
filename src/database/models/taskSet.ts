import { model, Schema, Document, Model } from 'mongoose';
import { TaskSetPriority, OperationState } from '../enums';
import { IUser } from './user';
import Task from './task';

interface ITaskSetDocument extends Document {
  _user: IUser['_id'],
  _runnable: string,
  _files: string[],
  name: string,
  argumentTemplate: string,
  graphs: any[],
  priority: TaskSetPriority,
  state: OperationState,
  startTime: Date,
  endTime?: Date,
  remainingTasksCount: number,
  errorLimitCount: number,
}

export interface ITaskSet extends ITaskSetDocument {
  updateRemainingTasksCount(): Promise<ITaskSet>,
}

interface ITaskSetModel extends Model<ITaskSet> {
}

const taskSetSchema: Schema = new Schema({
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  _runnable: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  // [_files] This schema will be used for file arguments for now. Although the
  // best way to do this is to separate into an hierarchy in order to get only
  // the files needed to each task.
  _files: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }],
  name: {
    type: String,
    required: true
  },
  argumentTemplate: {
    type: String,
    required: true
  },
  graphs: {
    type: {},
    default: [],
  },
  priority: {
    type: Number,
    default: TaskSetPriority.Minimum,
    required: true,
  },
  state: {
    type: Number,
    default: OperationState.Executing,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  endTime: {
    type: Date
  },
  remainingTasksCount: {
    type: Number,
    required: true,
  },
  errorLimitCount: {
    type: Number,
    required: true,
  }
});

taskSetSchema.methods.updateRemainingTasksCount = async function (): Promise<ITaskSet> {
  const taskFilter = {
    _taskSet: this._id,
    $or: [
      { state: OperationState.Pending },
      { state: OperationState.Sent },
      { state: OperationState.Executing }
    ]
  };
  const taskSet: ITaskSet = this;
  const count = await Task.count(taskFilter);
  taskSet.remainingTasksCount = count;
  return await taskSet.save();
};

export const TaskSet: ITaskSetModel = model<ITaskSet, ITaskSetModel>('TaskSet', taskSetSchema);

export default TaskSet;
