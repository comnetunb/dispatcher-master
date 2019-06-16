const mongoose = require('mongoose');

const { Schema } = mongoose;

const Result = {
  SUCCESS: 'success',
  NEUTRAL: 'neutral',
  WARNING: 'warning',
  ERROR: 'error',
};

const notificationSchema = Schema({
  userId: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  taskSetId: {
    type: Schema.ObjectId,
    ref: 'TaskSet',
  },
  taskId: {
    type: Schema.ObjectId,
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
    default: Result.NEUTRAL,
  },
  read: {
    type: Boolean,
    required: true,
    default: false,
  }
});

notificationSchema.statics.Result = Result;

notificationSchema.statics.getUnread = function (userId) {
  return this.find({ userId, read: false })
    .exec();
};

notificationSchema.statics.read = function (userId, notificationId) {
  return this.findOne({ userId, _id: notificationId, read: false })
    .then((notification) => {
      if (!notification) {
        throw `Unread notification from user ${userId} and of id ${notificationId} not found`;
      }

      notification.read = true;
      return notification.save();
    });
};

notificationSchema.statics.getAll = function (userId) {
  return this.find({ userId })
    .exec();
};

notificationSchema.statics.create = function (result, title, message, user, taskSetId, taskId) {
  const notification = new this({
    result,
    title,
    message,
    userId: user,
    taskSetId,
    taskId,
  });

  return notification.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
