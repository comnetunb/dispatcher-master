const User = databaseRequire('models/user');

module.exports = (app) => {
  app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;

    User
      .findOne({ email })
      .then((user) => {
        if (!user) {
          res.status(404).send('User not found.');
          return;
        }

        if (!user.validPassword(password)) {
          res.status(401).send('Incorrect password.');
          return;
        }

        res.status(200).send({ token: signJWT(user) });
      })
      .catch(() => {
        res.status(500).send('An internal error occurred.');
      });
  });
};

