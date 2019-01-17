const Slave = databaseRequire('models/slave');
const util = apiRequire('util');

module.exports = (app) => {
  app.get('/v1/slave', verifyJWT, (req, res) => {
    const sortFilter = util.getSortFilter(req.query.sort);

    Slave
      .find({})
      .sort(sortFilter)
      .then((slaves) => {
        const response = util.computeTablefication(
          slaves,
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
