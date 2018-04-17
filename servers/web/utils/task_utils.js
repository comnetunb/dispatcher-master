
const buildTasks = function (taskGroupSetData) {
  const runnableType = taskGroupSetData.runnableInfo.info.type
  const runnable = taskGroupSetData.runnableInfo.runnable[0]
  const argumentsTemplate = taskGroupSetData.argumentsTemplate
  const inputs = taskGroupSetData.inputs

  // Sort by precedence
  inputs.sort(function (a, b) { return (a.precedence > b.precedence) ? 1 : ((b.precedence > a.precedence) ? -1 : 0) })

  var parsedInputs = []

  for (let i in inputs) {
    switch (inputs[i].type) {
      case "N":
        parsedInputs.push({
          data: parseNumber(inputs[i].data),
          directiveIndex: inputs[i].directiveIndex
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
  var preprocessedArgumentTemplate = argumentsTemplate
  let index = 0

  while ((match = /(%n|%s|%f)/g.exec(preprocessedArgumentTemplate)) != null) {
    preprocessedArgumentTemplate = preprocessedArgumentTemplate.replace(match[0], '%' + index)
    ++index
  }

  var commandLines = []

  buildTaskCommandLines(prefix, parsedInputs, preprocessedArgumentTemplate, commandLines)

  console.log(commandLines)
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

  for (let i in values) {
    if (parsedInputs.length > 1) {
      infos.push({
        value: values[i],
        index: index
      })

      buildTaskCommandLines(prefix, parsedInputs.slice(1), argumentsTemplate, commandLines, infos)
    }
    else {
      let commandLine = prefix
      let arguments = argumentsTemplate

      infos.push({
        value: values[i],
        index: index
      })

      for (let info in infos) {
        arguments = arguments.replace('%' + infos[info].index, infos[info].value)
      }

      commandLine += arguments
      commandLines.push(commandLine)

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

function parseString(stringNotation) {
  // (["'])(?:(?=(\\?))\2.)*?\1(,(["'])(?:(?=(\\?))\2.)*?\1)*$
}

module.exports = {
  buildTasks: buildTasks
}
