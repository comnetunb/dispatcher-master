const Worker = databaseRequire('models/worker');
const config = rootRequire('api/config');

module.exports = (app) => {
  app.get('/api/v1/slave', (req, res) => {
    const { token } = req.query;

    if (!token) {
      res.status(401).json({ reason: 'No token provided.' });
      return;
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        res.status(500).json({ reason: 'Failed to authenticate token.' });
        return;
      }

      Worker
        .find({})
        .then((workers) => {
          res.status(200).json({ data: workers });
        }).catch((e) => {
          res.status(412).json({ reason: e });
        });
    });
  });
};

