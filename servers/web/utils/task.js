
const buildTasks = function (taskGroupSetData) {
  const taskRunnable = taskGroupSetData.taskRunnable[0]
  const argumentsTemplate = taskGroupSetData.argumentsTemplate
  const inputs = taskGroupSetData.inputs

  // Sort by precedence
  inputs.sort(function (a, b) { return (a.precedence > b.precedence) ? 1 : ((b.precedence > a.precedence) ? -1 : 0) })

  var parsedInputs = []

  for (let input in inputs) {
    switch (inputs[input].type) {
      case "number":
        parsedInputs.push({
          data: parseNumber(inputs[input].data),
          directiveIndex: inputs[input].directiveIndex
        })
        break
    }
  }

  var commandLines = []

  // TODO
  var prefix = "java -jar " + taskRunnable.name + " "
  // TODO: where does this preprocessing belong?
  var preprocessedArgumentTemplate = argumentsTemplate
  let index = 0

  while ((match = /(%n|%s|%f)/g.exec(preprocessedArgumentTemplate)) != null) {
    preprocessedArgumentTemplate = preprocessedArgumentTemplate.replace(match[0], '%' + index)
    ++index
  }

  buildTaskCommandLines(prefix, parsedInputs, preprocessedArgumentTemplate, commandLines)
}

//! Recursive method
function buildTaskCommandLines(prefix, parsedInputs, argumentsTemplate, commandLines, infos) {
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
      let newParsedInputs = parsedInputs.slice(1)

      infos.push({
        value: values[value],
        index: index
      })
      buildTaskCommandLines(prefix, newParsedInputs, argumentsTemplate, commandLines, infos)
      infos.splice(-1, 1)
    }
    else {
      let commandLine = prefix
      let arguments = argumentsTemplate

      infos.push({
        value: values[value],
        index: index
      })

      for (let info in infos) {
        arguments = arguments.replace('%' + infos[info].index, infos[info].value)
      }

      commandLine += arguments
      commandLines.push(commandLine)
      infos.splice(-1, 1)
    }
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

    for (var it = startValue; it <= endValue; it += increment) {
      values.push(it)
    }

    return values
  }

  // Comma separated notation
  matches = numberNotation.match(/^\d(,\d)*$/g)

  if (matches) {
    return matches[0].split(',')
      .map(function (value) {
        return Number(value)
      })
  }

  throw "Invalid notation: " + numberNotation
}

module.exports = {
  buildTasks: buildTasks
}