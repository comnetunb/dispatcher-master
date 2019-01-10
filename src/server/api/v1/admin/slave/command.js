const dispatcherProtocol = require('dispatcher-protocol');

const Slave = databaseRequire('models/slave');
const connectionManager = dispatcherRequire('connection_manager');

const { Flags } = dispatcherProtocol.common;
const { getReport, performCommand } = dispatcherProtocol.pdu;

module.exports = (app) => {
  app.post('/api/v1/slave/pause', verifyJWT, (req, res) => {
    const { id } = req.body;

    sendCommand(req, res, id, performCommand.Command.PAUSE);
  });

  app.post('/api/v1/slave/resume', verifyJWT, (req, res) => {
    const { id } = req.body;

    sendCommand(req, res, id, performCommand.Command.RESUME);
  });

  app.post('/api/v1/slave/stop', verifyJWT, (req, res) => {
    const { id } = req.body;

    sendCommand(req, res, id, performCommand.Command.STOP);
  });
};

sendCommand = (req, res, id, command) => {
  // TODO: Validate if user has permission to send a command to this slave

  if (!id) {
    res.status(412).send('No ID was given.');
    return;
  }

  Slave
    .findById(id)
    .then((slave) => {
      if (!slave) {
        res.status(412).send(e);
        return;
      }

      connectionManager.send(slave.uuid, performCommand.format({ command }));

      const flags = Flags.STATE | Flags.TASKS;

      connectionManager.send(slave.uuid, getReport.format({ flags }));

      res.status(200).send({});
    })
    .catch((e) => {
      res.status(500).send(e);
    });
};
