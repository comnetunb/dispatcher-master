
const taskUtils = webServerRequire('utils/task_utils');
const log = rootRequire('servers/shared/log');
const TaskSet = databaseRequire('models/task_set');
const Task = databaseRequire('models/task');

module.exports = (app) => {
  app.get('/api/task/get_executing', (req, res) => {
    const taskSetFilter = { state: TaskSet.State.EXECUTING };

    TaskSet
      .find(taskSetFilter)
      .then((taskSet) => {
        res.send(taskSet);
      })
      .catch((e) => {
        res.status(412).send({ reason: e });
      });
  });

  app.get('/api/task/get_finished', (req, res) => {
    const taskSetFilter = { state: TaskSet.State.FINISHED };

    TaskSet
      .find(taskSetFilter)
      .then((taskSet) => {
        res.send(taskSet);
      })
      .catch((e) => {
        res.status(412).send({ reason: e });
      });
  });

  app.post('/api/task/add_task_group_set', (req, res) => {
    try {
      taskUtils.buildTasks(req.body, req.user);
      res.sendStatus(200);
    } catch (e) {
      log.error(e);
      res.status(412).send({ reason: e });
    }
  });

  app.post('/api/task/remove_task_set', (req, res) => {
    try {
      const taskFilter = { _taskSet: req.body.id };

      Task.remove(taskFilter, () => { });

      const taskSetFilter = { _id: req.body.id };

      TaskSet.remove(taskSetFilter, () => { });

      res.sendStatus(200);
    } catch (e) {
      log.error(e);
      res.status(412).send({ reason: e });
    }
  });

  app.post('/api/task/edit_task_set', (req, res) => {
    try {
      const taskSetFilter = { _id: req.body.id };

      const taskSet = TaskSet.find(taskSetFilter);

      if (req.body.name) taskSet.name = req.body.name;
      if (req.body.priority) taskSet.priority = req.body.priority;
      // if (req.body.argumentTemplate) taskSet.argumentTemplate = req.body.argumentTemplate;

      TaskSet.save().then(() => {
        res.sendStatus(200);
      });
    } catch (e) {
      log.error(e);
      res.status(412).send({ reason: e });
    }
  });

  app.get('/api/task/supported_runnables', (req, res) => {
    res.send([{
      type: 'java',
      extension: '.jar'
    },
    {
      type: 'python',
      extension: '.py'
    }]);
  });

  app.get('/api/task/export', (req, res) => {
    taskUtils.exportTaskSet(req.query.taskSetId, req.query.format, (zipPath) => {
      if (!zipPath) {
        res.status(500);
      } else {
        res.sendFile(zipPath);
      }
    });
  });
};
