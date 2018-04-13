
const taskUtils = webServerRequire('/utils/task')

module.exports = function (app) {
  app.post('/add_task_group_set', function (req, res) {
    try {
      taskUtils.buildTasks(req.body)
      res.sendStatus(200)
    }
    catch (e) {
      console.log(e)
      res.status(412).send({ reason: e })
    }
  })

  app.get('/supported_executables', function (req, res) {
    res.send(['java', 'python'])
  })
}