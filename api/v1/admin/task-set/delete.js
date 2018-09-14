const TaskSet = databaseRequire('models/task_set');
const config = rootRequire('api/config');

module.exports = (app) => {
  app.post('/api/v1/taskset/delete', verifyJWT, (req, res) => {
    const { id } = req.body;

    TaskSet
      .findById(id)
      .remove()
      .then(() => {
        res.status(200).send();
      })
      .catch((e) => {
        res.status(412).json({ reason: e });
      });
  });
};

