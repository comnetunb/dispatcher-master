const mongoose = require('mongoose');

const { Schema } = mongoose;

const Type = {
  SUCCESS: 0,
  NEUTRAL: 1,
  WARNING: 2,
  ERROR: 3,
};

const notificationSchema = Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  taskSetId: {
    type: Schema.Types.ObjectId
  },
  taskId: {
    type: Schema.Types.ObjectId
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
  type: {
    type: Number,
    required: true,
    default: Type.NEUTRAL,
  },
  read: {
    type: Boolean,
    required: true,
    default: false,
  }
});

notificationSchema.statics.Type = Type;

module.exports = mongoose.model('Notification', notificationSchema);
