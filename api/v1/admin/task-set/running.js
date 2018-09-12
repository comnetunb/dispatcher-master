const TaskSet = databaseRequire('models/task_set');

module.exports = (app) => {
  app.get('/api/v1/taskset/running', verifyJWT, (req, res) => {
    const taskSetFilter = {
      _user: req.userId,
      state: TaskSet.State.EXECUTING
    };

    TaskSet
      .find(taskSetFilter)
      .then((taskSets) => {
        res.status(200).json({ data: taskSets });
      })
      .catch((e) => {
        res.status(412).json({ reason: e });
      });
  });
};

