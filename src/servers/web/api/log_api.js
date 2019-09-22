const log = rootRequire('servers/shared/log');

module.exports = (app) => {
  app.get('/api/log/get_all', (req, res) => {
    log
      .getAll(req.query.taskSetId)
      .then((logs) => {
        if (!logs) {
          throw String('Failed to get logs');
        }

        res.send(logs.reverse());
      })
      .catch((e) => {
        log.error(e);
        res.status(500).send({ reason: e });
      });
  });

  app.get('/api/log/get_all_from_date', (req, res) => {
    log
      .getAllFromDate(req.query.lastDate, req.query.taskSetId)
      .then((logs) => {
        if (!logs) {
          throw String('Failed to get logs');
        }

        res.send(logs.reverse());
      })
      .catch((e) => {
        log.error(e);
        res.status(500).send({ reason: e });
      });
  });
};
