
const taskUtils = webServerRequire('/utils/task_utils')

module.exports = function (app) {
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