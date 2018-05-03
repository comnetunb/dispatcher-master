const Task = databaseRequire('models/task')

module.exports = (app) => {
  app.get('/api/graph/plot_info', (req, res) => {
    const taskFilter = {
      _taskSet: req.query.taskSetId,
      state: Task.State.FINISHED
    }

    Task
      .findOne(taskFilter)
      .then(task => {
        let info = {
          axes: [],
          curves: []
        }

        if (!task) {
          res.send(info)
          return
        }

        info.axes = Object.getOwnPropertyNames(JSON.parse(task.result))

        for (let i = 0; i < task.indexes.length; ++i) {
          let option = {
            key: 'Argument ' + i,
            value: i
          }

          info.curves.push(option)
        }

        res.send(info)
      })
      .catch(e => {
        res.status(500).send({ reason: e })
      })
  })

  app.get('/api/graph/plot_data', (req, res) => {
    const index = req.query.index
    const xAxis = req.query.xAxis
    const yAxis = req.query.yAxis
    const taskSetId = req.query.taskSetId

    const taskFilter = {
      _taskSet: req.query.taskSetId,
      state: Task.State.FINISHED
    }

    Task
      .find(taskFilter)
      .then(tasks => {
        let curves = {}

        for (let task in tasks) {
          let curveIdx = tasks[task].indexes[index].toString()

          if (!curves.hasOwnProperty(curveIdx)) {
            curves[curveIdx] = {}
          }

          let result = JSON.parse(tasks[task].result)

          let xAxisIdx = result[xAxis].toString()

          if (!curves[curveIdx].hasOwnProperty(xAxisIdx)) {
            curves[curveIdx][xAxisIdx] = []
          }

          curves[curveIdx][xAxisIdx].push(result[yAxis])
        }

        res.send(curves)
      })
      .catch(e => {
        res.status(500).send({ reason: e })
      })
  })
}