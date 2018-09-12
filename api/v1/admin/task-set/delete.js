const TaskSet = databaseRequire('models/task_set');
const config = rootRequire('api/config');

module.exports = (app) => {
  app.post('/api/v1/taskset/delete', (req, res) => {
    const { token, id } = req.body;

    if (!token) {
      res.status(401).json({ reason: 'No token provided.' });
      return;
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        res.status(500).json({ reason: 'Failed to authenticate token.' });
        return;
      }

      TaskSet
        .findById(id)
        .remove()
        .then(() => {
          res.status(200);
        })
        .catch((e) => {
          res.status(412).json({ reason: e });
        });
    });
  });
};

