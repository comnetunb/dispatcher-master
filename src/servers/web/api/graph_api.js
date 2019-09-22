const Task = databaseRequire('models/task');
const TaskSet = databaseRequire('models/task_set');

module.exports = (app) => {
  app.get('/api/graph/plot_info', (req, res) => {
    const taskFilter = {
      _taskSet: req.query.taskSetId,
    };

    Task
      .findOne(taskFilter)
      .populate('_taskSet')
      .then((task) => {
        const info = {
          axes: [],
          curves: [],
          graphs: [],
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

        info.graphs = task._taskSet.graphs;

        res.send(info);
      })
      .catch((e) => {
        res.status(500).send({ reason: e });
      });
  });

  app.post('/api/graph/plot_data', (req, res) => {
    const graphs = req.body.body;
    const taskFilter = {
      _taskSet: req.body.params.taskSetId,
      state: Task.State.FINISHED
    };

    Task
      .find(taskFilter)
      .then((tasks) => {
        const graphsCurves = [];

        for (let i = 0; i < graphs.length; i += 1) {
          if (graphs[i].curve !== undefined && graphs[i].xAxis && graphs[i].xAxis) {
            const curves = {};

            for (let task in tasks) { // eslint-disable-line
              const curveIdx = tasks[task].indexes[graphs[i].curve].toString();

              if (!curves.hasOwnProperty(curveIdx)) {
                curves[curveIdx] = {};
              }

              const result = JSON.parse(tasks[task].result);

              const xAxisIdx = result[graphs[i].xAxis].toString();

              if (!curves[curveIdx].hasOwnProperty(xAxisIdx)) {
                curves[curveIdx][xAxisIdx] = [];
              }

              curves[curveIdx][xAxisIdx].push(result[graphs[i].yAxis]);
            }

            graphsCurves.push(curves);
          } else {
            graphsCurves.push(undefined);
          }
        }
        res.send(graphsCurves);
        TaskSet.findOne({ _id: req.body.params.taskSetId }).then(a => {
          a.graphs = graphs;
          a.save();
        });
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send({ reason: e });
      });
  });
};
