const User = databaseRequire('models/user');
const config = rootRequire('api/config');

module.exports = (app) => {
  app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;

    User
      .findOne({ email })
      .then((user) => {
        if (!user) {
          res.status(404).json({ reason: 'User not found.' });
          return;
        }

        if (!user.validPassword(password)) {
          res.status(401).json({ reason: 'Incorrect password.' });
          return;
        }

        res.status(200).send({ token: signJWTUser(user) });
      })
      .catch(() => {
        res.status(500).json({ reason: 'An internal error occurred.' });
      });
  });
};

