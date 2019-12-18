import tmp from 'tmp';
import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs';
import archiver from 'archiver';
import { Parser as Json2csvParser } from 'json2csv';
import TaskSet, { ITaskSet } from '../../../database/models/taskSet';
import Task, { ITask } from '../../../database/models/task';
import File, { IFile } from '../../../database/models/file';
import { TaskSetData, InputFile, ParsedInput } from '../api/taskSetData';
import { IUser } from '../../../database/models/user';
import { OperationState, TaskSetPriority, InputType, Result } from '../../../api/enums';
import { ExportFormat } from '../api/exportFormat';
import { CreateTasksetRequest, EditTasksetRequest } from '../../web/client/src/app/api/create-taskset-request';
import { mongo } from 'mongoose';
import sanitize from 'sanitize-filename';

interface ProcessedInput {
  input: string;
  index: number;
  innerIndex: number;
}

export async function createTaskset(request: CreateTasksetRequest, user: IUser): Promise<ITaskSet> {
  const existingTaskset = await TaskSet.findOne({ name: request.name, _user: user._id });
  if (existingTaskset != null) {
    throw 'There already exists a Task Set with this name.';
  }

  let taskSet = new TaskSet({
    name: request.name,
    description: request.description,
    _user: user._id,
    inputs: request.inputs,
    errorLimitCount: request.errorCountLimit,
    _runnable: request.runnableId,
    _runnableType: request.runnableType,
    argumentTemplate: request.template,
    state: OperationState.Executing,
    remainingTasksCount: 0,
    totalTasksCount: 0,
    priority: TaskSetPriority.Normal,
    inputLabels: [],
    _files: [],
  });

  const inputs = request.inputs.sort((a, b) => {
    if (a.priority > b.priority) return 1;
    if (a.priority < b.priority) return -1;
    return 0;
  });

  let processedInputs: string[][] = [];
  for (let input of inputs) {
    if (input.type == InputType.CommaSeparatedValues) {
      processedInputs.push(processCSVInput(input.input as string));
    } else if (input.type == InputType.Files) {
      processedInputs.push(await processFilesInput(input.input as string[]));
      let fileIds = input.input as string[];
      for (let i = 0; i < fileIds.length; i++) {
        taskSet._files.push(fileIds[i]);
      }
    } else if (input.type == InputType.StartEndStep) {
      processedInputs.push(processStartEndStepInput(input.input as string));
    }

    taskSet.inputLabels.push(input.label);
  }
  taskSet = await taskSet.save();
  let runnable = await File.findById(taskSet._runnable);
  let template = `${taskSet._runnableType} ${runnable.name} ${taskSet.argumentTemplate}`;
  let tasks = await createTasks(taskSet._id, template, processedInputs);

  const tasksSavePromises: Promise<ITask>[] = [];
  for (let task of tasks) {
    tasksSavePromises.push(task.save());
  }
  await Promise.all(tasksSavePromises);

  const tasksCount = await Task.countDocuments({ _taskSet: taskSet._id });
  taskSet.totalTasksCount = tasksCount;
  await taskSet.save();
  await taskSet.updateRemainingTasksCount();
  return taskSet;
}


export async function editTaskset(taskset: ITaskSet, request: EditTasksetRequest, user: IUser): Promise<ITaskSet> {
  taskset.name = request.name;
  taskset.description = request.description;
  taskset.errorLimitCount = request.errorCountLimit;
  taskset._runnable = request.runnableId;
  taskset._runnableType = request.runnableType;
  taskset._files = [];
  taskset.inputLabels = [];
  taskset.inputs = request.inputs;

  const inputs = request.inputs.sort((a, b) => {
    if (a.priority > b.priority) return 1;
    if (a.priority < b.priority) return -1;
    return 0;
  });

  let processedInputs: string[][] = [];
  for (let input of inputs) {
    if (input.type == InputType.CommaSeparatedValues) {
      processedInputs.push(processCSVInput(input.input as string));
    } else if (input.type == InputType.Files) {
      processedInputs.push(await processFilesInput(input.input as string[]));
      let fileIds = input.input as string[];
      for (let i = 0; i < fileIds.length; i++) {
        taskset._files.push(fileIds[i]);
      }
    } else if (input.type == InputType.StartEndStep) {
      processedInputs.push(processStartEndStepInput(input.input as string));
    }

    taskset.inputLabels.push(input.label);
  }

  await Task.updateMany({ _taskSet: taskset._id }, { $set: { underEdit: true } });
  taskset = await taskset.save();

  let runnable = await File.findById(taskset._runnable);
  let template = `${taskset._runnableType} ${runnable.name} ${taskset.argumentTemplate}`;
  let tasks = await createTasks(taskset._id, template, processedInputs);

  let newTasks = false;

  const promises = await tasks.map(async task => {
    const existingTask = await Task.findOne({
      _taskSet: taskset._id,
      arguments: task.arguments,
      commandLine: task.commandLine,
    });

    if (!existingTask) {
      newTasks = true;
      return await task.save();
    }

    existingTask.precedence = task.precedence;
    existingTask.underEdit = false;
    return await existingTask.save();
  });

  await Promise.all(promises);
  await Task.deleteMany({ _taskSet: taskset._id, underEdit: true });

  const tasksCount = await Task.countDocuments({ _taskSet: taskset._id });
  if (newTasks && taskset.state != OperationState.Canceled) {
    taskset.state = OperationState.Executing;
  }
  taskset.totalTasksCount = tasksCount;
  await taskset.save();
  await taskset.updateRemainingTasksCount();
  return taskset;
}

async function getCommandFromTemplateAndInputs(template: string, inputs: ProcessedInput[]) {
  let processed = template;
  for (let input of inputs) {
    const idx = input.index;
    const reg = new RegExp(`\(?<!\\\\)\\{${idx}\\}`)
    processed = processed.replace(reg, input.input);
  }

  return processed;
}

async function createTasks(tasksetId: string, template: string, inputs: string[][]): Promise<ITask[]> {
  const tasks: ITask[] = [];

  let processedInputs: ProcessedInput[][] = [[]];

  for (let curLevel = 0; curLevel < inputs.length; curLevel++) {
    let newProcessedInputs: ProcessedInput[][] = [];
    for (let i = 0; i < processedInputs.length; i++) {
      for (let j = 0; j < inputs[curLevel].length; j++) {
        const newInput = processedInputs[i].slice();
        newInput.push({
          input: inputs[curLevel][j],
          index: curLevel,
          innerIndex: j,
        });
        newProcessedInputs.push(newInput);
      }
    }
    processedInputs = newProcessedInputs;
  }

  for (let i = 0; i < processedInputs.length; i++) {
    let curInput = processedInputs[i];
    const command = await getCommandFromTemplateAndInputs(template, curInput);
    let precedence = 0;
    let indexes = [];
    let args = [];
    for (let i = 0; i < curInput.length; i++) {
      precedence *= inputs[i].length;
      precedence += curInput[i].innerIndex;
      indexes.push(curInput[i].innerIndex);
      args.push(curInput[i].input);
    }

    const newTask = new Task({
      _taskSet: tasksetId,
      commandLine: command,
      precedence,
      arguments: args,
    });
    tasks.push(newTask);
  }

  return tasks;
}

function processStartEndStepInput(input: string) {
  let matches = input.match(/\d+;\d+;\d+/g);

  if (matches) {
    const loopValues = matches[0].split(';');

    const startValue = Number(loopValues[0]);
    const endValue = Number(loopValues[1]);
    const increment = Number(loopValues[2]);

    const values: string[] = [];

    for (let it = startValue; it <= endValue; it += increment) {
      values.push(it.toString());
    }

    return values;
  } else {
    throw 'Invalid Start End Step input';
  }
}

async function processFilesInput(ids: string[]) {
  let fileNames: string[] = [];
  let promises: Promise<void>[] = [];
  for (let id of ids) {
    promises.push(new Promise(async (resolve, reject) => {
      try {
        const file = await File.findById(id);
        fileNames.push(file.name);
        resolve();
      } catch (err) {
        reject(`Could not find file of id ${id}`);
      }
    }));
  };

  const result = await Promise.all(promises);
  return fileNames;
}

// https://stackoverflow.com/a/14991797/6149445
function processCSVInput(input: string) {

  let arr = [];
  let quote = false;  // true means we're inside a quoted field

  // iterate over each character, keep track of current row and column (of the returned array)
  for (let row = 0, col = 0, c = 0; c < input.length; c++) {
    let cc = input[c], nc = input[c + 1];        // current character, next character
    arr[row] = arr[row] || [];             // create a new row if necessary
    arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

    // If the current character is a quotation mark, and we're inside a
    // quoted field, and the next character is also a quotation mark,
    // add a quotation mark to the current column and skip the next character
    if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

    // If it's just one quotation mark, begin/end quoted field
    if (cc == '"') { quote = !quote; continue; }

    // If it's a comma and we're not in a quoted field, move on to the next column
    if (cc == ',' && !quote) { ++col; continue; }

    // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
    // and move on to the next row and move to column 0 of that new row
    if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

    // If it's a newline (LF or CR) and we're not in a quoted field,
    // move on to the next row and move to column 0 of that new row
    if (cc == '\n' && !quote) { ++row; col = 0; continue; }
    if (cc == '\r' && !quote) { ++row; col = 0; continue; }

    // Otherwise, append the current character to the current column
    arr[row][col] += cc;
  }
  return arr[0];
}

export async function exportTaskSet(tasksetId: string, format: ExportFormat = ExportFormat.JSON): Promise<string> {
  const taskFilter = {
    _taskSet: tasksetId,
    state: OperationState.Finished,
  };

  const taskset = await TaskSet.findById(tasksetId);
  const tasks = await Task.find(taskFilter);

  if (tasks.length < 1) {
    throw 'There aren\'t any finished tasks';
  }

  const tmpPath = tmp.dirSync();
  const baseName = `${taskset.name}`;
  const promises: Promise<any>[] = [];

  for (let task in tasks) { // eslint-disable-line
    let base = baseName;
    const argumentsArray = tasks[task].arguments;

    for (let i = 0; i < argumentsArray.length; i += 1) {
      if (i === argumentsArray.length - 1) {
        base += `-${argumentsArray[i]}.${format}`;
      } else {
        base += `-${argumentsArray[i]}`;
      }
    }
    base = sanitize(base);
    const filePath = path.join(tmpPath.name, base);
    switch (format) {
      case ExportFormat.JSON:
        promises.push(writeFile(filePath, tasks[task].result));
        break;

      case ExportFormat.CSV:
        const result = JSON.parse(tasks[task].result);
        const fields = Object.getOwnPropertyNames(result);
        const json2csvParser = new Json2csvParser({ fields });
        const csv = json2csvParser.parse(result);
        promises.push(writeFile(filePath, csv));
        break;

      default:
    }
  }

  await Promise.all(promises);

  const zipPath = `${tmpPath.name}/${taskset.name}.zip`;
  await zipDirectory(tmpPath.name, zipPath);
  return zipPath;
};

function zipDirectory(source: string, out: fs.PathLike): Promise<void> {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream)
      ;

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

function writeFile(filePath: string, data: any) {
  return new Promise((resolve, reject) => {
    mkdirp(path.dirname(filePath), (e) => {
      if (e) {
        return reject(e);
      }

      return fs.writeFile(filePath, data, resolve);
    });
  });
}
