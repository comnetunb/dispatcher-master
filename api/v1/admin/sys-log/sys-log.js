const log = rootRequire('servers/shared/log');

module.exports = (app) => {
  app.get('/api/v1/syslog', (req, res) => {
    log
      .getAll()
      .then((logs) => {
        if (!logs) {
          res.status(412).send('Failed to get logs');
          return;
        }

        res.status(200).send({ data: logs.reverse() });
      })
      .catch((e) => {
        log.error(e);
        res.status(500).send(e);
      });
  });
}