// !
// ! Version: MIT
// !
// ! Portions created by Matheus Medeiros are Copyright (c) 2017-2018
// ! Matheus Medeiros. All Rights Reserved.
// !
// ! Permission is hereby granted, free of charge, to any person obtaining a
// ! copy of this software and associated documentation files(the "Software"),
// ! to deal in the Software without restriction, including without limitation
// ! the rights to use, copy, modify, merge, publish, distribute, sublicense,
// ! and / or sell copies of the Software, and to permit persons to whom the
// ! Software is furnished to do so, subject to the following conditions:
// !
// ! The above copyright notice and this permission notice shall be included in
// ! all copies or substantial portions of the Software.
// !
// ! THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// ! IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// ! FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// ! AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// ! LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// ! FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// ! DEALINGS IN THE SOFTWARE.
// !

const mongoose = require('mongoose');

const { Schema } = mongoose;

const State = {
  EXECUTING: 0,
  FINISHED: 1,
  CANCELED: 2
};

const Priority = {
  MINIMUM: 0,
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4
};

const taskSetSchema = Schema({
  _user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  _runnable: {
    type: Schema.ObjectId,
    ref: 'File',
    required: true
  },
  // [_files] This schema will be used for file arguments for now. Although the
  // best way to do this is to separate into an hierarchy in order to get only
  // the files needed to each task.
  _files: [{
    type: Schema.ObjectId,
    ref: 'File'
  }],
  name: {
    type: String,
    required: true
  },
  argumentTemplate: {
    type: String
  },
  graphs: {
    type: {},
  },
  priority: {
    type: Number,
    default: Priority.MINIMUM
  },
  state: {
    type: Number,
    default: State.EXECUTING
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  remainingTasksCount: {
    type: Number
  }
});

taskSetSchema.statics.State = State;
taskSetSchema.statics.Priority = Priority;

taskSetSchema.statics.UpdateRemainingTasksCount = (id) => {
  const Task = databaseRequire('models/task'); // eslint-disable-line no-undef

  const taskFilter = {
    _taskSet: id,
    $or: [
      { state: Task.State.PENDING },
      { state: Task.State.SENT },
      { state: Task.State.EXECUTING }
    ]
  };

  return Task
    .count(taskFilter)
    .then((count) => {
      const taskSetFilter = { _id: id };
      const taskSetUpdate = { remainingTasksCount: count };

      return model.update(taskSetFilter, taskSetUpdate); // eslint-disable-line
    });
};

const model = mongoose.model('TaskSet', taskSetSchema);

module.exports = model;
