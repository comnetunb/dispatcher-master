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

const tmp = require('tmp');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');
const zipFolder = require('zip-folder');
const Json2csvParser = require('json2csv').Parser;

const TaskSet = databaseRequire('models/taskSet');
const Task = databaseRequire('models/task');
const File = databaseRequire('models/file');

const buildTasks = (taskSetData, user) => {
  const taskSetName = taskSetData.name;
  const runnableType = taskSetData.runnableInfo.info.type;
  const runnable = taskSetData.runnableInfo.runnable[0];
  const { inputs, argumentTemplate, errorLimit } = taskSetData;

  // Sort by precedence
  inputs.sort((first, second) => {
    if (first.precedence > second.precedence) return 1;
    if (second.precedence > first.precedence) return -1;
    return 0;
  });

  const newFiles = [];
  const parsedInputs = [];

  for (let input in inputs) { // eslint-disable-line
    switch (inputs[input].type) {
      case 'N':
        parsedInputs.push({
          data: parseNumber(inputs[input].data),
          directiveIndex: inputs[input].directiveIndex
        });
        break;

      case 'S':
        parsedInputs.push({
          data: parseString(inputs[input].data),
          directiveIndex: inputs[input].directiveIndex
        });
        break;

      case 'F':
        const data = [];
        const files = inputs[input].data;

        for (let file in files) { // eslint-disable-line
          data.push(files[file].name);

          const newFile = new File({
            _user: user._id,
            name: files[file].name,
            dataURL: files[file].data
          });

          newFiles.push(newFile);
        }

        parsedInputs.push({
          data,
          directiveIndex: inputs[input].directiveIndex
        });
        break;

      default:
    }
  }

  // TODO: Get prefix command on database
  let prefix = '';
  switch (runnableType) {
    case 'java':
      prefix += `java -jar ${runnable.name} `;
      break;

    case 'python':
      prefix += `python ${runnable.name} `;
      break;

    default:
  }

  // TODO: where does this preprocessing belong?
  let index = 0;
  let preProcessedArgumentTemplate = argumentTemplate;
  let match = /(%n|%s|%f)/g.exec(preProcessedArgumentTemplate);
  while (match != null) {
    preProcessedArgumentTemplate = preProcessedArgumentTemplate.replace(match[0], `%${index}`);
    match = /(%n|%s|%f)/g.exec(preProcessedArgumentTemplate);
    index += 1;
  }

  commandLineTemplate = prefix + preProcessedArgumentTemplate;

  File
    .insertMany(newFiles)
    .then((files) => {
      const fileIds = [];

      for (let file in files) { // eslint-disable-line
        fileIds.push(files[file]._id);
      }

      const newRunnable = new File({
        _user: user._id,
        name: runnable.name,
        dataURL: runnable.data
      });

      return newRunnable
        .save()
        .then((savedRunnable) => {
          const newTaskSet = new TaskSet({
            _user: user._id,
            _runnable: savedRunnable._id,
            _files: fileIds,
            name: taskSetName,
            argumentTemplate,
            errorLimitCount: errorLimit,
          });

          return newTaskSet.save();
        });
    })
    .then((taskSet) => {
      const promises = [];

      buildTaskSet(commandLineTemplate, parsedInputs, taskSet._id, promises);

      Promise
        .all(promises)
        .then(() => {
          TaskSet.UpdateRemainingTasksCount(taskSet._id);
        });
    })
    .catch((e) => {
      throw String(`An internal error occurred. Please try again later. ${e}`);
    });
};

const editTaskSet = async (taskSetData) => {
  const taskSetName = taskSetData.name;
  const taskSetPriority = taskSetData.priority;
  // const runnableType = taskSetData.runnableInfo.info.type;
  // const runnable = taskSetData.runnableInfo.runnable[0];
  // const { inputs } = taskSetData;
  // const { argumentTemplate } = taskSetData;
  const oldTaskSet = await TaskSet.findOne({ _id: taskSetData._id });

  // // Sort by precedence
  // inputs.sort((first, second) => {
  //   if (first.precedence > second.precedence) return 1;
  //   if (second.precedence > first.precedence) return -1;
  //   return 0;
  // });

  // const newFiles = [];
  // const parsedInputs = [];

  // for (let input in inputs) { // eslint-disable-line
  //   switch (inputs[input].type) {
  //     case 'N':
  //       parsedInputs.push({
  //         data: parseNumber(inputs[input].data),
  //         directiveIndex: inputs[input].directiveIndex
  //       });
  //       break;

  //     case 'F':
  //       const data = [];
  //       const files = inputs[input].data;

  //       for (let file in files) { // eslint-disable-line
  //         data.push(files[file].name);

  //         const newFile = new File({
  //           _user: user._id,
  //           name: files[file].name,
  //           dataURL: files[file].data
  //         });

  //         newFiles.push(newFile);
  //       }

  //       parsedInputs.push({
  //         data,
  //         directiveIndex: inputs[input].directiveIndex
  //       });
  //       break;

  //     default:
  //   }
  // }

  // // TODO: Get prefix command on database
  // let prefix = '';
  // switch (runnableType) {
  //   case 'java':
  //     prefix += `java -jar ${runnable.name} `;
  //     break;

  //   case 'python':
  //     prefix += `python ${runnable.name} `;
  //     break;

  //   default:
  // }

  // // TODO: where does this preprocessing belong?
  // let index = 0;
  // let preProcessedArgumentTemplate = argumentTemplate;
  // let match = /(%n|%s|%f)/g.exec(preProcessedArgumentTemplate);
  // while (match != null) {
  //   preProcessedArgumentTemplate = preProcessedArgumentTemplate.replace(match[0], `%${index}`);
  //   match = /(%n|%s|%f)/g.exec(preProcessedArgumentTemplate);
  //   index += 1;
  // }

  // commandLineTemplate = prefix + preProcessedArgumentTemplate;

  // const files = File.insertMany(newFiles);
  // const fileIds = [];

  // for (let file in files) { // eslint-disable-line
  //   fileIds.push(files[file]._id);
  // }

  // const newRunnable = new File({
  //   _user: user._id,
  //   name: runnable.name,
  //   dataURL: runnable.data
  // });

  // const savedRunnable = newRunnable.save();

  if (taskSetName) oldTaskSet.name = taskSetName;
  if (taskSetPriority) oldTaskSet.priority = taskSetPriority;

  const savedTaskSet = await oldTaskSet.save();
  // const promises = [];

  // buildTaskSet(commandLineTemplate, parsedInputs, savedTaskSet._id, promises);

  // await Promise.all(promises);
  TaskSet.UpdateRemainingTasksCount(savedTaskSet._id);
};

//! Recursive method
function buildTaskSet(commandLineTemplate, parsedInputs, taskSetId, promises, infos = []) {
  if (!parsedInputs.length) {
    return;
  }

  const values = parsedInputs[0].data;
  const index = parsedInputs[0].directiveIndex;

  for (let value in values) { // eslint-disable-line
    infos.push({
      value: values[value],
      index,
      argumentIndex: Number(value),
      argumentLength: values.length
    });

    if (parsedInputs.length > 1) {
      buildTaskSet(commandLineTemplate, parsedInputs.slice(1), taskSetId, promises, infos);
    } else {
      let commandLine = commandLineTemplate;
      let precedence = 0;
      let accumulator = 1;
      const indexes = [];
      const argumentsArray = [];

      for (let info in infos) { // eslint-disable-line
        commandLine = commandLine.replace(`%${infos[info].index}`, infos[info].value);
        precedence += infos[info].argumentIndex * accumulator;
        accumulator *= infos[info].argumentLength;
        indexes.push(infos[info].argumentIndex);
        argumentsArray.push(infos[info].value);
      }

      const newTask = new Task({
        _taskSet: taskSetId,
        indexes,
        commandLine,
        precedence,
        arguments: argumentsArray
      });

      promises.push(newTask.save());
    }

    infos.splice(-1, 1);
  }
}

function parseString(stringNotation) {
  const strings = [];
  let cancel = false;
  let currentString = '';
  for (let i = 0; i < stringNotation.length; i += 1) {
    const char = stringNotation[i];
    switch (char) {
      case ',':
        if (cancel) {
          currentString += char;
          cancel = false;
        } else {
          strings.push(currentString);
          currentString = '';
        }
        break;
      case '\\':
        if (cancel) {
          currentString += char;
          cancel = false;
        } else {
          cancel = true;
        }
        break;
      default:
        currentString += char;
    }
  }
  strings.push(currentString);
  return strings;
}

function parseNumber(numberNotation) {
  let matches;

  // Loop notation
  matches = numberNotation.match(/\d+;\d+;\d+/g);

  if (matches) {
    const loopValues = matches[0].split(';');

    const startValue = Number(loopValues[0]);
    const endValue = Number(loopValues[1]);
    const increment = Number(loopValues[2]);

    const values = [];

    for (let it = startValue; it <= endValue; it += increment) {
      values.push(it);
    }

    return values;
  }

  // Comma separated notation
  matches = numberNotation.match(/^\d+(,\d+)*$/g);

  if (matches) {
    return matches[0]
      .split(',')
      .map((value) => {
        return Number(value);
      });
  }

  throw String(`Invalid notation: ${numberNotation}`);
}

const exportTaskSet = (taskSetId, format, callback) => {
  const taskFilter = {
    _taskSet: taskSetId,
    state: Task.State.FINISHED
  };

  return Task
    .find(taskFilter)
    .populate('_taskSet')
    .then((tasks) => {
      if (tasks.length < 1) {
        return callback(null);
      }

      return tmp.dir((err, tmpPath) => {
        if (err) {
          return callback(null);
        }

        const rootPath = `${tmpPath}/${tasks[0]._taskSet.name}`;

        const promises = [];

        for (let task in tasks) { // eslint-disable-line
          const taskPath = {
            dir: rootPath,
            base: ''
          };

          const argumentsArray = tasks[task].arguments;

          for (let i = 0; i < argumentsArray.length; i += 1) {
            if (i === argumentsArray.length - 1) {
              taskPath.base = argumentsArray[i] + (format === 'csv' ? '.csv' : '.json');
            } else {
              taskPath.dir += `/${argumentsArray[i]}`;
            }
          }

          const filePath = path.posix.format(taskPath);

          switch (format) {
            case 'json':
              promises.push(writeFile(filePath, tasks[task].result));
              break;

            case 'csv':
              const result = JSON.parse(tasks[task].result);
              const fields = Object.getOwnPropertyNames(result);
              const json2csvParser = new Json2csvParser({ fields });
              const csv = json2csvParser.parse(result);
              promises.push(writeFile(filePath, csv));
              break;

            default:
          }
        }

        return Promise
          .all(promises)
          .then(() => {
            const zipPath = `${tmpPath}/${tasks[0]._taskSet.name}.zip`;
            zipFolder(rootPath, zipPath, (err2) => {
              if (err2) {
                return callback(null);
              }

              return callback(zipPath);
            });
          });
      });
    })
    .catch(() => {
      throw String('An internal error occurred. Please try again later.');
    });
};

function writeFile(filePath, contents) {
  return new Promise((resolve, reject) => {
    mkdirp(path.dirname(filePath), (e) => {
      if (e) {
        return reject(e);
      }

      return fs.writeFile(filePath, contents, resolve);
    });
  });
}

module.exports = {
  buildTasks,
  exportTaskSet,
  editTaskSet
};
