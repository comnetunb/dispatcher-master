
const Worker = databaseRequire('models/worker');
const log = rootRequire('servers/shared/log');

const interfaceManager = rootRequire('servers/shared/interface_manager');

module.exports = (app) => {
  app.post('/api/worker/pause', (req, res) => {
    interfaceManager.pauseWorker(req.body.address);
    res.send();
  });

  app.post('/api/worker/resume', (req, res) => {
    interfaceManager.resumeWorker(req.body.address);
    res.send();
  });

  app.post('/api/worker/stop', (req, res) => {
    interfaceManager.stopWorker(req.body.address);
    res.send();
  });

  app.get('/api/worker/get_all', (req, res) => {
    Worker
      .find({}, '-_id')
      .then((workers) => {
        res.send(workers);
      }).catch((e) => {
        log.error(e);
      });
  });
};
