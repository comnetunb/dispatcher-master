import { model, Schema, Document, Model } from 'mongoose';
import { ITaskSet } from './taskSet';
import { ITask } from './task';
import { IUser } from './user';
import { Result } from '../../api/enums';

interface INotificationDocument extends Document {
  userId: IUser['_id'],
  tasksetId?: ITaskSet['_id'],
  taskId?: ITask['_id'],
  title: string,
  message: string,
  date: Date,
  result: Result,
  read: boolean,
}

export interface INotification extends INotificationDocument {

}

interface INotificationModel extends Model<INotification> {
  getUnread(userId: string): Promise<INotification[]>,
  read(userId: string, notificationId: string): Promise<INotification>,
  getAllFromUser(userId: string): Promise<INotification[]>,
  add(result: Result, title: string, message: string, userId: string, tasksetId?: string, taskId?: string): Promise<INotification>,
}

const notificationSchema: Schema<INotification, INotificationModel> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tasksetId: {
    type: Schema.Types.ObjectId,
    ref: 'TaskSet',
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  result: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    required: true,
    default: false,
    index: true,
  }
});

notificationSchema.statics.getUnread = async function (userId: string): Promise<INotification[]> {
  return await Notification.find({ userId, read: false });
};

notificationSchema.statics.read = function read(userId: string, notificationId: string): Promise<INotification> {
  return Notification.findOne({ userId, _id: notificationId, read: false })
    .then((notification) => {
      if (!notification) {
        throw `Unread notification from user ${userId} and of id ${notificationId} not found`;
      }

      notification.read = true;
      return notification.save();
    });
};

notificationSchema.statics.getAllFromUser = async function (userId: string): Promise<INotification[]> {
  return await Notification.find({ userId, read: false });
};

notificationSchema.statics.add = function (result: Result, title: string, message: string,
  userId: string, tasksetId?: string, taskId?: string): Promise<INotification> {
  const notification = new Notification({
    result,
    title,
    message,
    userId,
    tasksetId,
    taskId,
  });

  return notification.save();
};

export const Notification: INotificationModel = model<INotification, INotificationModel>('Notification', notificationSchema);

export default Notification;
