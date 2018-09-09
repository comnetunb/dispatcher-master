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
          res.status(401).json({ reason: 'Unauthorized.' });
          return;
        }

        const token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).json({ token });
      })
      .catch(() => {
        res.status(500).json({ reason: 'An internal error occurred.' });
      });
  });
};

