const Worker = databaseRequire('models/worker');
const util = rootRequire('api/util');

module.exports = (app) => {
  app.get('/api/v1/slave', verifyJWT, (req, res) => {
    const sortFilter = util.getSortFilter(req.query.sort);

    Worker
      .find({})
      .sort(sortFilter)
      .then((workers) => {
        const response = util.computeTablefication(
          workers,
          parseInt(req.query.page, 10),
          parseInt(req.query.per_page, 10),
          req.query.filter
        );

        res.status(200).send(response);
      })
      .catch((e) => {
        res.status(412).json({ reason: e });
      });
  });
};
