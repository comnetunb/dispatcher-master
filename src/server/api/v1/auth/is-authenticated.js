
module.exports = (app) => {
  // verifyJWT will do the authentication logic
  app.get('/api/v1/auth/is-authenticated', verifyJWT, (req, res) => {
    res.status(200).send({});
  });
};
