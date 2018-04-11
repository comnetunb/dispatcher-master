
const buildTasks = function (taskGroupSetData) {
  const taskRunnable = taskGroupSetData.taskRunnable[0]

  const inputs = taskGroupSetData.inputs

  for (let input in inputs) {
    switch (inputs[input].type) {
      case "number":
        parseNumber(inputs[input].data)
        break
    }
  }
}

function parseNumber(number) {

  var matches

  // Loop notation
  matches = number.match(/\d+\;\d+\;\d+/g)
  console.log(matches)

  // Comma separated notation
  matches = number.match(/^\d(,\d)*$/g)
  console.log(matches)
}

module.exports = {
  buildTasks: buildTasks
}