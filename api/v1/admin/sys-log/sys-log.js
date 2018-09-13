const Log = databaseRequire('models/log');
const util = rootRequire('api/util');

module.exports = (app) => {
  app.get('/api/v1/sys-log', verifyJWT, (req, res) => {
    // const logFilter = {};
    const logFilter = { session: Log.SessionId };

    Log
      .find(logFilter)
      .then((logs) => {
        const response = util.computeTablefication(
          logs,
          req.query.sort,
          parseInt(req.query.page, 10),
          parseInt(req.query.per_page, 10),
          req.query.filter
        );

        res.status(200).send(response);
      })
      .catch((e) => {
        res.status(500).send(e);
      });
  });
};

