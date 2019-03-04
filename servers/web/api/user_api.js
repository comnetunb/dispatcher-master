
const User = rootRequire('database/models/user');

module.exports = (app, passport) => {
  app.post('/api/user/sign_in', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err) { return res.status(401).send(err); }
      if (!user) { return res.status(401).json(info); }
      return res.json(user);
    })(req, res, next);
  });

  app.get('/api/user/signed_in', (req, res) => {
    res.send(req.isAuthenticated() ? req.user : null);
  });

  app.post('/api/user/sign_out', (req, res) => {
    req.logOut();
    res.sendStatus(200);
  });

  app.post('/api/user/sign_up', (req, res) => {
    const userFilter = { email: req.body.email };

    User
      .findOne(userFilter)
      .then((user) => {
        if (user) {
          res.status(409).send({ reason: 'User already exists.' });
          return;
        }

        const { email, name, password } = req.body;

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
            .save()
            .then(() => {
              res.send();
            })
            .catch(() => {
              res.status(500).send({ reason: 'An internal error occurred. Please try again later.' });
            });
        });
      })
      .catch(() => {
        res.status(500).send({ reason: 'An internal error occurred. Please try again later.' });
      });
  });
};
