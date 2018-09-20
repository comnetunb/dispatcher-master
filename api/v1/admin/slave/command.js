const Worker = databaseRequire('models/worker');
const { Command } = protocolRequire('dwp/pdu/perform_command');
const connectionManager = rootRequire('servers/dispatcher/connection_manager');

const { Flags } = protocolRequire('dwp/common');
const getReport = protocolRequire('dwp/pdu/get_report');
const performCommand = protocolRequire('dwp/pdu/perform_command');

module.exports = (app) => {
  app.post('/api/v1/slave/pause', verifyJWT, (req, res) => {
    const { id } = req.body;

    sendCommand(req, res, id, Command.PAUSE);
  });

  app.post('/api/v1/slave/resume', verifyJWT, (req, res) => {
    const { id } = req.body;

    sendCommand(req, res, id, Command.RESUME);
  });

  app.post('/api/v1/slave/stop', verifyJWT, (req, res) => {
    const { id } = req.body;

    sendCommand(req, res, id, Command.STOP);
  });
};

sendCommand = (req, res, id, command) => {
  // TODO: Validate if user has permission to send a command to this worker

  if (!id) {
    res.status(412).send('No ID was given.');
    return;
  }

  Worker
    .findById(id)
    .then((worker) => {
      if (!worker) {
        res.status(412).send(e);
        return;
      }

      connectionManager.send(worker.uuid, performCommand.format({ command }));

      const flags = Flags.STATE | Flags.TASKS;

      connectionManager.send(worker.uuid, getReport.format({ flags }));

      res.status(200).send({});
    })
    .catch((e) => {
      res.status(500).send(e);
    });
}
;
