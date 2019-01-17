const TaskSet = databaseRequire('models/task_set');
const util = apiRequire('util');

module.exports = (app) => {
  app.get('/v1/taskset/running', verifyJWT, (req, res) => {
    const taskSetFilter = {
      _user: req.userId,
      state: TaskSet.State.EXECUTING
    };

    const sortFilter = util.getSortFilter(req.query.sort);

    TaskSet
      .find(taskSetFilter)
      .sort(sortFilter)
      .then((taskSets) => {
        const response = util.computeTablefication(
          taskSets,
          parseInt(req.query.page, 10),
          parseInt(req.query.per_page, 10),
          req.query.filter
        );

        res.status(200).send(response);
      })
      .catch((e) => {
        res.status(412).json({ reason: e });
      });
  });
};