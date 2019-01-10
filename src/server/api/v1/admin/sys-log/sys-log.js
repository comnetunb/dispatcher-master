const Log = databaseRequire('models/log');
const util = apiRequire('util');

module.exports = (app) => {
  app.get('/api/v1/sys-log', verifyJWT, (req, res) => {
    const logFilter = { session: Log.SessionId };

    const sortFilter = util.getSortFilter(req.query.sort);

    Log
      .find(logFilter)
      .sort(sortFilter)
      .then((logs) => {
        const response = util.computeTablefication(
          logs,
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
