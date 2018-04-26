//!
//! Version: MIT
//!
//! Portions created by Matheus Medeiros are Copyright (c) 2017-2018
//! Matheus Medeiros. All Rights Reserved.
//!
//! Permission is hereby granted, free of charge, to any person obtaining a
//! copy of this software and associated documentation files(the "Software"),
//! to deal in the Software without restriction, including without limitation
//! the rights to use, copy, modify, merge, publish, distribute, sublicense,
//! and / or sell copies of the Software, and to permit persons to whom the
//! Software is furnished to do so, subject to the following conditions:
//!
//! The above copyright notice and this permission notice shall be included in
//! all copies or substantial portions of the Software.
//!
//! THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//! IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//! FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
//! AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//! LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//! FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
//! DEALINGS IN THE SOFTWARE.
//!


const mongoose = require('mongoose')
const Schema = mongoose.Schema

const State = {
  PENDING: 0,
  EXECUTING: 1,
  FINISHED: 2,
  CANCELED: 3,
  SENT: 4
}

const taskSchema = Schema({
  _taskSet: {
    type: Schema.ObjectId,
    ref: 'TaskSet',
    required: true
  },
  _argument: {
    type: Schema.ObjectId,
    ref: 'Argument'
  },
  commandLine: {
    type: String,
    required: true
  },
  precedence: {
    type: Number,
    required: true
  },
  worker: {
    type: String
  },
  state: {
    type: Number,
    default: State.PENDING
  },
  result: {
    type: String
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  }
})

taskSchema.statics.State = State

taskSchema.statics.updateToDefaultState = function (taskId) {
  const taskPopulate = { path: '_taskSet' }

  return model
    .findById(taskId)
    .populate(taskPopulate)
    .then(function (task) {
      const taskSetState = task._taskSet.state

      task.worker = undefined
      task.startTime = undefined

      const TaskSet = databaseRequire('models/task_set')

      if (taskSetState === TaskSet.State.EXECUTING) {
        task.state = State.PENDING
      }
      else {
        task.state = State.CANCELED
      }

      return task.save()
    })
}

taskSchema.methods.isPending = function () {
  return this.state === State.PENDING
}

taskSchema.methods.isSent = function () {
  return this.state === State.SENT
}

taskSchema.methods.isExecuting = function () {
  return this.state === State.EXECUTING
}

taskSchema.methods.isFinished = function () {
  return this.state === State.FINISHED
}

taskSchema.methods.isCanceled = function () {
  return this.state === State.CANCELED
}

const model = mongoose.model('Task', taskSchema)

module.exports = model