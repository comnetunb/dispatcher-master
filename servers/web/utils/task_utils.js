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

const TaskSet = databaseRequire('models/task_set')
const Argument = databaseRequire('models/argument')
const Task = databaseRequire('models/task')
const File = databaseRequire('models/file')

const buildTasks = function (taskGroupSetData, user) {
  const taskSetName = taskGroupSetData.name
  const runnableType = taskGroupSetData.runnableInfo.info.type
  const runnable = taskGroupSetData.runnableInfo.runnable[0]
  const inputs = taskGroupSetData.inputs
  const argumentsTemplate = taskGroupSetData.argumentsTemplate

  // Sort by precedence
  inputs.sort(function (a, b) { return (a.precedence > b.precedence) ? 1 : ((b.precedence > a.precedence) ? -1 : 0) })

  var parsedInputs = []

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

  const newRunnable = new File({
    _user: user._id,
    name: runnable.name,
    dataURL: runnable.data
  })

  newRunnable
    .save()
    .then(runnable => {
      const newTaskSet = new TaskSet({
        _user: user._id,
        _runnable: runnable._id,
        name: taskSetName,
        argumentsTemplate: argumentsTemplate
      })

      return newTaskSet.save()
    })
    .then(taskSet => {
      buildTaskSet(commandLineTemplate, parsedInputs)
    })
    .catch(e => {
      throw 'An internal error occurred. Please try again later.'
    })
}

//! Recursive method
function buildTaskSet(commandLineTemplate, parsedInputs, infos) {
  if (!parsedInputs.length) {
    return
  }

  if (!infos) {
    infos = []
  }

  const values = parsedInputs[0].data
  const index = parsedInputs[0].directiveIndex

  for (let value in values) {
    if (parsedInputs.length > 1) {
      infos.push({
        value: values[value],
        index: index
      })

      buildTaskSet(commandLineTemplate, parsedInputs.slice(1), infos)
    }
    else {
      infos.push({
        value: values[value],
        index: index
      })

      let commandLine = commandLineTemplate

      for (let info in infos) {
        commandLine = commandLine.replace('%' + infos[info].index, infos[info].value)
      }

      console.log(commandLine)
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
  matches = numberNotation.match(/^\d(,\d)*$/g)

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

module.exports = {
  buildTasks: buildTasks
}
