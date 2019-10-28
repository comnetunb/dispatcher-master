import { model, Schema, Document, Model } from 'mongoose';
import { TaskSetPriority, OperationState, InputType } from '../../api/enums';
import { IUser } from './user';
import Task from './task';

export interface IInput {
  index: number;
  priority: number;
  type: InputType;
  input: string | string[];
}

interface ITaskSetDocument extends Document {
  _user: IUser['_id'],
  _runnable: string,
  _runnableType: string,
  _files: string[],
  name: string,
  description: string,
  argumentTemplate: string,
  graphs: any[],
  priority: TaskSetPriority,
  state: OperationState,
  startTime: Date,
  endTime?: Date,
  remainingTasksCount: number,
  errorLimitCount: number,
  inputs: IInput[],
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
  _runnableType: {
    type: String,
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
  description: {
    type: String,
    required: true,
    default: '',
  },
  argumentTemplate: {
    type: String,
    required: true
  },
  inputs: {
    type: {},
    default: [],
  },
  priority: {
    type: Number,
    default: TaskSetPriority.Normal,
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

export interface TaskSetFilter {
  _id?: string,
  name?: string,
  pending?: boolean,
  permitted?: boolean,
  argumentTemplate?: string,
  priority?: TaskSetPriority,
  state?: OperationState,
  startTime?: Date,
  endTime?: Date,
  remainingTasksCount?: number,
  errorLimitCount?: number,
  [key: string]: any,
}

export const TaskSet: ITaskSetModel = model<ITaskSet, ITaskSetModel>('TaskSet', taskSetSchema);

export default TaskSet;
