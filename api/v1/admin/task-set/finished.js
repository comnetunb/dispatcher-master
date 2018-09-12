const TaskSet = databaseRequire('models/task_set');
const config = rootRequire('api/config');

module.exports = (app) => {
  app.get('/api/v1/taskset/finished', (req, res) => {
    const { token } = req.query;

    if (!token) {
      res.status(401).json({ reason: 'No token provided.' });
      return;
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        res.status(500).json({ reason: 'Failed to authenticate token.' });
        return;
      }

      const taskSetFilter = {
        _user: decoded.id,
        state: TaskSet.State.FINISHED
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
  });
};

