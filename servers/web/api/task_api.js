
const taskUtils = webServerRequire('utils/task_utils')

const TaskSet = databaseRequire('models/task_set')
const Task = databaseRequire('models/task')

module.exports = function (app) {
  app.get('/api/task/get_executing', (req, res) => {
    const taskSetFilter = { state: TaskSet.State.EXECUTING }

    TaskSet
      .find(taskSetFilter)
      .then(taskSet => {
        res.send(taskSet)
      })
      .catch(e => {
        res.status(412).send({ reason: e })
      })
  })

  app.get('/api/task/get_finished', (req, res) => {
    const taskSetFilter = { state: TaskSet.State.FINISHED }

    TaskSet
      .find(taskSetFilter)
      .then(taskSet => {
        res.send(taskSet)
      })
      .catch(e => {
        res.status(412).send({ reason: e })
      })
  })

  app.post('/api/task/add_task_group_set', function (req, res) {
    try {
      taskUtils.buildTasks(req.body, req.user)
      res.sendStatus(200)
    }
    catch (e) {
      console.log(e)
      res.status(412).send({ reason: e })
    }
  })

  app.post('/api/task/remove_task_set', function (req, res) {
    try {
      const taskFilter = { _taskSet: req.body.id };

      Task
        .remove(taskFilter, () => { })

      const taskSetFilter = { _id: req.body.id };

      TaskSet
        .remove(taskSetFilter, () => { })

      res.sendStatus(200)
    }
    catch (e) {
      console.log(e)
      res.status(412).send({ reason: e })
    }
  })

  app.get('/api/task/supported_runnables', function (req, res) {
    res.send([{
      type: 'java',
      extension: '.jar'
    },
    {
      type: 'python',
      extension: '.py'
    }])
  })
}