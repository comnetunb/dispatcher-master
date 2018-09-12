const Worker = databaseRequire('models/worker');

module.exports = (app) => {
  app.get('/api/v1/slave', verifyJWT, (req, res) => {
    Worker
      .find({})
      .then((workers) => {
        res.status(200).json({ data: workers });
      })
      .catch((e) => {
        res.status(412).json({ reason: e });
      });
  });
};
