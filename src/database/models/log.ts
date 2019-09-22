import { model, Schema, Document, Model, Types } from 'mongoose';
import { LogLevel } from '../enums';
import Task from './task';
export const SessionId = Types.ObjectId();

export interface ILog extends Document {
  log: string,
  date: Date,
  level: LogLevel,
  taskId?: string,
  session: string,
}

interface ILogModel extends Model<ILog> {
  getAllLogs(taskSetId?: string): Promise<ILog[]>,
  getAllStartingFromDate(date: Date, taskSetId?: string): Promise<ILog[]>,
}

const logSchema: Schema = new Schema({
  log: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  session: {
    type: Schema.Types.ObjectId,
    default: SessionId
  }
});

logSchema.statics.getAllLogs = async (taskSetId?: string): Promise<ILog[]> => {
  let logFilter;

  if (taskSetId) {
    // get all tasks pertaining to taskSet
    const taskList = await Task.find({ _taskSet: taskSetId }, '_id');
    const taskIds = taskList.map(task => task._id);
    logFilter = { taskId: { $in: taskIds } };
  } else {
    logFilter = { session: SessionId };
  }

  return Log.find(logFilter).sort({ date: -1 });
};

logSchema.statics.getAllStartingFromDate =
  async (date: Date, taskSetId?: string): Promise<ILog[]> => {
    let logFilter;
    if (taskSetId) {
      const taskList = await Task.find({ _taskSet: taskSetId }, '_id');
      const taskIds = taskList.map(task => task._id);
      logFilter = { date: { $gt: date }, taskId: { $in: taskIds } };
    } else {
      logFilter = { date: { $gt: date }, session: SessionId };
    }

    return Log.find(logFilter).sort({ date: -1 });
  };

export const Log: ILogModel = model<ILog, ILogModel>('Log', logSchema);

export default Log;
