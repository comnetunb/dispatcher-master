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

const tmp = require('tmp')
const path = require('path')
const mkdirp = require('mkdirp');
const fs = require('fs');
const zipFolder = require('zip-folder');
const Json2csvParser = require('json2csv').Parser;

const TaskSet = databaseRequire('models/task_set')
const Task = databaseRequire('models/task')
const File = databaseRequire('models/file')

const buildTasks = function (taskSetData, user) {
  const taskSetName = taskSetData.name
  const runnableType = taskSetData.runnableInfo.info.type
  const runnable = taskSetData.runnableInfo.runnable[0]
  const inputs = taskSetData.inputs
  const argumentsTemplate = taskSetData.argumentsTemplate

  // Sort by precedence
  inputs.sort((first, second) => { return (first.precedence > second.precedence) ? 1 : ((second.precedence > first.precedence) ? -1 : 0) })

  let newFiles = []
  let parsedInputs = []

  for (let input in inputs) {
    switch (inputs[input].type) {
      case 'N':
        parsedInputs.push({
          data: parseNumber(inputs[input].data),
          directiveIndex: inputs[input].directiveIndex
        })
        break

      case 'F':
        let data = []
        let files = inputs[input].data

        for (let file in files) {
          data.push(files[file].name)

          const newFile = new File({
            _user: user._id,
            name: files[file].name,
            dataURL: files[file].data
          })

          newFiles.push(newFile)
        }

        parsedInputs.push({
          data: data,
          directiveIndex: inputs[input].directiveIndex
        })
        break
    }
  }

  // TODO: Get prefix command on database
  var prefix = ''
  switch (runnableType) {
    case 'java':
      prefix += 'java -jar ' + runnable.name + ' '
      break

    case 'python':
      prefix += 'python ' + runnable.name + ' '
      break
  }

  // TODO: where does this preprocessing belong?
  let index = 0
  let preProcessedArgumentsTemplate = argumentsTemplate
  while ((match = /(%n|%s|%f)/g.exec(preProcessedArgumentsTemplate)) != null) {
    preProcessedArgumentsTemplate = preProcessedArgumentsTemplate.replace(match[0], '%' + index)
    ++index
  }

  commandLineTemplate = prefix + preProcessedArgumentsTemplate

  File
    .insertMany(newFiles)
    .then(files => {
      let fileIds = []

      for (let file in files) {
        fileIds.push(files[file]._id)
      }

      const newRunnable = new File({
        _user: user._id,
        name: runnable.name,
        dataURL: runnable.data
      })

      return newRunnable
        .save()
        .then(runnable => {
          const newTaskSet = new TaskSet({
            _user: user._id,
            _runnable: runnable._id,
            _files: fileIds,
            name: taskSetName,
            argumentTemplate: argumentsTemplate
          })

          return newTaskSet.save()
        })
    })
    .then(taskSet => {
      var promises = []

      buildTaskSet(commandLineTemplate, parsedInputs, taskSet._id, promises)

      Promise
        .all(promises)
        .then(function () {
          TaskSet.UpdateRemainingTasksCount(taskSet._id)
        })
    })
    .catch(e => {
      throw 'An internal error occurred. Please try again later.' + e
    })
}

//! Recursive method
function buildTaskSet(commandLineTemplate, parsedInputs, taskSetId, promises, infos = []) {
  if (!parsedInputs.length) {
    return
  }

  const values = parsedInputs[0].data
  const index = parsedInputs[0].directiveIndex

  for (let value in values) {
    infos.push({
      value: values[value],
      index: index,
      argumentIndex: Number(value),
      argumentLength: values.length
    })

    if (parsedInputs.length > 1) {
      buildTaskSet(commandLineTemplate, parsedInputs.slice(1), taskSetId, promises, infos)
    }
    else {
      let commandLine = commandLineTemplate
      let precedence = 0
      let accumulator = 1
      let indexes = []
      let arguments = []

      for (let info in infos) {
        commandLine = commandLine.replace('%' + infos[info].index, infos[info].value)
        precedence += infos[info].argumentIndex * accumulator
        accumulator *= infos[info].argumentLength
        indexes.push(infos[info].argumentIndex)
        arguments.push(infos[info].value)
      }

      let newTask = new Task({
        _taskSet: taskSetId,
        indexes: indexes,
        commandLine: commandLine,
        precedence: precedence,
        arguments: arguments
      })

      promises.push(newTask.save())
    }

    infos.splice(-1, 1)
  }
}

function parseNumber(numberNotation) {
  var matches

  // Loop notation
  matches = numberNotation.match(/\d+\;\d+\;\d+/g)

  if (matches) {
    const loopValues = matches[0].split(';')

    const startValue = Number(loopValues[0])
    const endValue = Number(loopValues[1])
    const increment = Number(loopValues[2])

    let values = []

    for (let it = startValue; it <= endValue; it += increment) {
      values.push(it)
    }

    return values
  }

  // Comma separated notation
  matches = numberNotation.match(/^\d+(,\d+)*$/g)

  if (matches) {
    return matches[0]
      .split(',')
      .map(function (value) {
        return Number(value)
      })
  }

  throw "Invalid notation: " + numberNotation
}

function parseString(stringNotation) {
  // (["'])(?:(?=(\\?))\2.)*?\1(,(["'])(?:(?=(\\?))\2.)*?\1)*$
}

const exportTaskSet = (taskSetId, format, callback) => {
  const taskFilter = {
    _taskSet: taskSetId,
    state: Task.State.FINISHED
  }

  return Task
    .find(taskFilter)
    .populate('_taskSet')
    .then(tasks => {
      if (tasks.length < 1) {
        return callback(null)
      }

      return tmp.dir((err, tmpPath) => {
        if (err) {
          return callback(null)
        }

        let rootPath = tmpPath + '/' + tasks[0]._taskSet.name

        let promises = []

        for (let task in tasks) {
          let taskPath = {
            dir: rootPath,
            base: ''
          }

          const arguments = tasks[task].arguments

          for (let i = 0; i < arguments.length; ++i) {
            if (i === arguments.length - 1) {
              taskPath.base = arguments[i] + (format === 'csv' ? '.csv' : '.json')
              continue
            }

            taskPath.dir += '/' + arguments[i]
          }

          const filePath = path.posix.format(taskPath)

          switch (format) {
            case 'json':
              promises.push(writeFile(filePath, tasks[task].result))
              break

            case 'csv':
              const result = JSON.parse(tasks[task].result)
              const fields = Object.getOwnPropertyNames(result)
              const json2csvParser = new Json2csvParser({ fields });
              const csv = json2csvParser.parse(result);
              promises.push(writeFile(filePath, csv))
              break
          }
        }

        return Promise
          .all(promises)
          .then(() => {
            const zipPath = tmpPath + '/' + tasks[0]._taskSet.name + '.zip'
            zipFolder(rootPath, zipPath, function (err) {
              if (err) {
                return callback(null)
              }

              return callback(zipPath)
            });
          })
      })
    })
    .catch(e => {
      throw "An internal error occurred. Please try again later."
    })
}

function writeFile(filePath, contents) {
  return new Promise((resolve, reject) => {
    mkdirp(path.dirname(filePath), e => {
      if (e) {
        return reject(e)
      }

      fs.writeFile(filePath, contents, resolve);
    });
  })
}

module.exports = {
  buildTasks: buildTasks,
  exportTaskSet: exportTaskSet
}
