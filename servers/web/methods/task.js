
const taskUtils = webServerRequire('/utils/task')

module.exports = function (app) {
  app.post('/add_task_group_set', function (req, res) {
    try {
      taskUtils.buildTasks(req.body)
      res.sendStatus(200)
    }
    catch (e) {
      res.sendStatus(412).send({ reason: e })
    }
  })
}