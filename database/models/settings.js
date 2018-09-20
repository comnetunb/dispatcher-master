const mongoose = require('mongoose');

const { Schema } = mongoose;

const settingsSchema = Schema({
  master: {
    resourceRequestInterval: {
      type: Number,
      min: 1,
      default: 1
    },
    taskDispatchInterval: {
      type: Number,
      min: 1,
      default: 1
    }
  },
  slave: {
    threshold: {
      cpu: {
        type: Number,
        min: 0,
        max: 100,
        default: 70
      },
      memory: {
        type: Number,
        min: 0,
        max: 100,
        default: 70
      }
    }
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
