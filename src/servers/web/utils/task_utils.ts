import tmp from 'tmp';
import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs';
import archiver from 'archiver';
import { Parser as Json2csvParser } from 'json2csv';
import TaskSet from '../../../database/models/taskSet';
import Task from '../../../database/models/task';
import File, { IFile } from '../../../database/models/file';
import { TaskSetData, InputType, InputFile, ParsedInput } from '../api/taskSetData';
import { IUser } from '../../../database/models/user';
import { OperationState } from '../../../database/enums';
import { ExportFormat } from '../api/exportFormat';

export async function buildTasks(taskSetData: TaskSetData, user: IUser): Promise<void> {
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

  const newFiles: IFile[] = [];
  const parsedInputs: ParsedInput[] = [];

  for (let input in inputs) { // eslint-disable-line
    switch (inputs[input].type) {
      case InputType.Number:
        parsedInputs.push({
          data: parseNumber(inputs[input].data as string),
          directiveIndex: inputs[input].directiveIndex
        });
        break;

      case InputType.String:
        parsedInputs.push({
          data: parseString(inputs[input].data as string),
          directiveIndex: inputs[input].directiveIndex
        });
        break;

      case InputType.File:
        const data = [];
        const files = inputs[input].data as InputFile[];

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

  const commandLineTemplate = prefix + preProcessedArgumentTemplate;

  try {

    const files = await File.insertMany(newFiles);
    const fileIds = [];

    for (let file in files) { // eslint-disable-line
      fileIds.push(files[file]._id);
    }

    const newRunnable = new File({
      _user: user._id,
      name: runnable.name,
      dataURL: runnable.data
    });

    const savedRunnable = await newRunnable.save();

    const newTaskSet = new TaskSet({
      _user: user._id,
      _runnable: savedRunnable._id,
      _files: fileIds,
      name: taskSetName,
      argumentTemplate,
      errorLimitCount: errorLimit,
      remainingTasksCount: 0,
    });

    const taskSet = await newTaskSet.save();
    const promises: Promise<any>[] = [];

    buildTaskSet(commandLineTemplate, parsedInputs, taskSet._id, promises);

    await Promise.all(promises);
    await taskSet.updateRemainingTasksCount();
  } catch (err) {
    throw String(`An internal error occurred. Please try again later. ${err}`);
  }
};

//! Recursive method
function buildTaskSet(commandLineTemplate: string,
  parsedInputs: ParsedInput[],
  taskSetId: string,
  promises: Promise<any>[],
  infos = []) {

  if (!parsedInputs.length) {
    return;
  }

  const values = parsedInputs[0].data;
  const index = parsedInputs[0].directiveIndex;

  for (let i = 0; i < values.length; i += 1) { // eslint-disable-line
    infos.push({
      value: values[i],
      index,
      argumentIndex: i,
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
        arguments: argumentsArray,

      });

      promises.push(newTask.save());
    }

    infos.splice(-1, 1);
  }
}

function parseString(stringNotation: string): string[] {
  const strings: string[] = [];
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

function parseNumber(numberNotation: string): number[] {
  let matches = numberNotation.match(/\d+;\d+;\d+/g);

  if (matches) {
    const loopValues = matches[0].split(';');

    const startValue = Number(loopValues[0]);
    const endValue = Number(loopValues[1]);
    const increment = Number(loopValues[2]);

    const values: number[] = [];

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

export async function exportTaskSet(taskSetId: string, format: ExportFormat): Promise<string> {
  const taskFilter = {
    _taskSet: taskSetId,
    state: OperationState.Finished,
  };

  const tasks = await Task.find(taskFilter).populate('_taskSet');

  if (tasks.length < 1) {
    throw 'There aren\'nt any finished tasks';
  }

  const tmpPath = tmp.dirSync();
  const rootPath = `${tmpPath}`;
  const baseName = `${tasks[0]._taskSet.name}`;
  const promises: Promise<any>[] = [];

  for (let task in tasks) { // eslint-disable-line
    const taskPath: path.FormatInputPathObject = {
      dir: rootPath,
      base: baseName,
    };

    const argumentsArray = tasks[task].arguments;

    for (let i = 0; i < argumentsArray.length; i += 1) {
      if (i === argumentsArray.length - 1) {
        taskPath.base += `-${argumentsArray[i]}.${format}`;
      } else {
        taskPath.base += `-${argumentsArray[i]}`;
      }
    }

    const filePath = path.posix.format(taskPath);

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

  const zipPath = `${tmpPath}/${tasks[0]._taskSet.name}.zip`;
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

function writeFile(filePath: string, any: any) {
  return new Promise((resolve, reject) => {
    mkdirp(path.dirname(filePath), (e) => {
      if (e) {
        return reject(e);
      }

      return fs.writeFile(filePath, any, resolve);
    });
  });
}
