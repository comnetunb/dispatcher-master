const Notification = databaseRequire('models/notification');
const log = rootRequire('servers/shared/log');

module.exports = (app) => {
  app.get('/api/notifications', (req, res) => {
    if (!req.user || !req.user._id) {
      return res.sendStatus(401);
    }
    return Notification
      .getUnread(req.user._id)
      .then((notifications) => {
        res.send(notifications.reverse());
      })
      .catch((e) => {
        log.error(e);
        res.status(500).send({ reason: e });
      });
  });

  app.post('/api/notifications/:id', (req, res) => {
    if (!req.user || !req.user._id) {
      return res.sendStatus(401);
    }

    return Notification
      .read(req.user._id, req.params.id)
      .then((notification) => {
        res.send(notification);
      })
      .catch((e) => {
        log.error(e);
        res.status(500).send({ reason: e });
      });
  })

  app.get('/api/notifications/all', (req, res) => {
    if (!req.user || !req.user._id) {
      return res.sendStatus(401);
    }
    return Notification
      .getAll(req.user._id)
      .then((notifications) => {
        res.send(notifications.reverse());
      })
      .catch((e) => {
        log.error(e);
        res.status(500).send({ reason: e });
      });
  });
};
