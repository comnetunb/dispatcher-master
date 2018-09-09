const User = databaseRequire('models/user');

module.exports = (app) => {
  app.post('/api/v1/auth/signup', (req, res) => {
    const { email, name, password } = req.body;

    User
      .count({ email })
      .then((count) => {
        if (count > 0) {
          res.status(409).send({ reason: 'User already exists.' });
          return;
        }

        User.encryptPassword(password, (e, hash) => {
          if (e) {
            throw e;
          }

          const newUser = new User({
            email,
            name,
            password: hash
          });

          newUser
            .save((err, user) => {
              if (err) {
                throw err;
              }

              const token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
              });

              res.status(200).send({ auth: true, token });
            });
        });
      })
      .catch(() => {
        res.status(500).send({ reason: 'An internal error occurred. Please try again later.' });
      });
  });
};
