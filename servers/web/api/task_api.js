
const taskUtils = webServerRequire('utils/task_utils');
const log = rootRequire('servers/shared/log');
const TaskSet = databaseRequire('models/task_set');
const Task = databaseRequire('models/task');

module.exports = (app) => {
  app.get('/api/tasks', (req, res) => {
    if (!req.user || !req.user._id) {
      res.sendStatus(401);
    }
    const taskSetFilter = { _user: req.user._id };

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
      if (!req.user || !req.user._id) {
        res.sendStatus(401);
      }
      taskUtils.buildTasks(req.body, req.user);
      res.sendStatus(200);
    } catch (e) {
      log.error(e);
      res.status(412).send({ reason: e });
    }
  });

  app.post('/api/task/remove_task_set', (req, res) => {
    try {
      if (!req.user || !req.user._id) {
        res.sendStatus(401);
      }
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

  app.post('/api/task/cancel_task_set', (req, res) => {
    try {
      if (!req.user || !req.user._id) {
        res.sendStatus(401);
      }

      const taskFilter = { _taskSet: req.body.id, state: Task.State.PENDING };

      Task.update(taskFilter, { $set: { state: Task.State.CANCELED } }, { multi: true }, () => {});

      const taskSetFilter = { _id: req.body.id, state: TaskSet.State.EXECUTING };

      TaskSet.update(taskSetFilter, { $set: { state: TaskSet.State.CANCELED, endTime: new Date() } }, () => {}); // eslint-disable-line

      res.sendStatus(200);
    } catch (e) {
      log.error(e);
      res.status(412).send({ reason: e });
    }
  });

  app.post('/api/task/edit_task_set', async (req, res) => {
    try {
      if (!req.user || !req.user._id) {
        res.sendStatus(401);
      }

      await taskUtils.editTaskSet(req.body);
      res.sendStatus(200);
    } catch (e) {
      log.error(e);
      res.status(412).send({ reason: e });
    }
  });

  app.get('/api/task/supported_runnables', (req, res) => {
    if (!req.user || !req.user._id) {
      res.sendStatus(401);
    }
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

  app.get('/api/task/:id', (req, res) => {
    const taskSetFilter = { _id: req.params.id };

    TaskSet
      .findOne(taskSetFilter)
      .then((taskSet) => {
        if (req.query.includeTasks === 'true') {
          Task
            .find({ _taskSet: req.params.id })
            .then((tasks) => {
              const completeTaskSet = taskSet.toObject();
              completeTaskSet.tasks = tasks;
              res.send(completeTaskSet);
            });
        } else {
          res.send(taskSet);
        }
      })
      .catch((e) => {
        res.status(412).send({ reason: e });
      });
  });
};
