const Notification = databaseRequire('models/notification');

module.exports = (app) => {
  app.get('/api/notifications', (req, res) => {
    Notification
      .getUnread(req.user._id)
      .then((notifications) => {
        res.send(notifications.reverse());
      })
      .catch((e) => {
        log.error(e);
        res.status(500).send({ reason: e });
      });
  });

  app.get('/api/notifications/all', (req, res) => {
    Notification
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
