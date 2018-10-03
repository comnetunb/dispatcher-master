
const Slave = databaseRequire('models/slave');
const log = rootRequire('servers/shared/log');

const interfaceManager = rootRequire('servers/shared/interface_manager');

module.exports = (app) => {
  app.post('/api/slave/pause', (req, res) => {
    interfaceManager.pauseSlave(req.body.address);
    res.send();
  });

  app.post('/api/slave/resume', (req, res) => {
    interfaceManager.resumeSlave(req.body.address);
    res.send();
  });

  app.post('/api/slave/stop', (req, res) => {
    interfaceManager.stopSlave(req.body.address);
    res.send();
  });

  app.get('/api/slave/get_all', (req, res) => {
    Slave
      .find({}, '-_id')
      .then((slaves) => {
        res.send(slaves);
      }).catch((e) => {
        log.error(e);
      });
  });
};
