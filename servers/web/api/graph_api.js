const Task = databaseRequire('models/task');

module.exports = (app) => {
  app.get('/api/graph/plot_info', (req, res) => {
    const taskFilter = {
      _taskSet: req.query.taskSetId,
      state: Task.State.FINISHED
    };

    Task
      .findOne(taskFilter)
      .populate('_taskSet')
      .then((task) => {
        const info = {
          axes: [],
          curves: []
        };

        if (!task) {
          res.send(info);
          return;
        }

        info.argumentTemplate = task._taskSet.argumentTemplate;
        info.axes = Object.getOwnPropertyNames(JSON.parse(task.result));

        for (let i = 0; i < task.indexes.length; i += 1) {
          const option = {
            key: `Argument ${i}`,
            value: i
          };

          info.curves.push(option);
        }

        res.send(info);
      })
      .catch((e) => {
        res.status(500).send({ reason: e });
      });
  });

  app.get('/api/graph/plot_data', (req, res) => {
    const { index, xAxis, yAxis } = req.query;

    const taskFilter = {
      _taskSet: req.query.taskSetId,
      state: Task.State.FINISHED
    };

    Task
      .find(taskFilter)
      .then((tasks) => {
        const curves = {};

        for (let task in tasks) { // eslint-disable-line
          const curveIdx = tasks[task].indexes[index].toString();

          if (!curves.hasOwnProperty(curveIdx)) {
            curves[curveIdx] = {};
          }

          const result = JSON.parse(tasks[task].result);

          const xAxisIdx = result[xAxis].toString();

          if (!curves[curveIdx].hasOwnProperty(xAxisIdx)) {
            curves[curveIdx][xAxisIdx] = [];
          }

          curves[curveIdx][xAxisIdx].push(result[yAxis]);
        }

        res.send(curves);
      })
      .catch((e) => {
        res.status(500).send({ reason: e });
      });
  });
};
