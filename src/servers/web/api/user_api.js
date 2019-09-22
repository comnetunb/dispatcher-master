
const User = rootRequire('database/models/user');

module.exports = (app, passport) => {
  app.post('/api/user/sign_in', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err) { return res.status(401).send(err); }
      if (!user) { return res.status(401).json(info); }

      return req.logIn(user, function (err2) {
        if (err) { return next(err2); }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.get('/api/user/signed_in', (req, res) => {
    return res.send(req.user);
    res.send(req.isAuthenticated() ? req.user : null);
  });

  app.post('/api/user/sign_out', (req, res) => {
    req.logOut();
    res.sendStatus(200);
  });

  app.post('/api/user/manage/:id', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send();
    }

    if (!req.user.admin) {
      return res.status(403).send();
    }

    const userFilter = { _id: req.params.id };
    const allow = req.query.disallow ? false : true;

    User
      .findOne(userFilter)
      .then((user) => {
        user.permitted = allow;
        user.pending = false;
        user.save().then(() => res.send());
      })
      .catch((e) => {
        res.status(412).send({ reason: e });
      });
  });

  app.get('/api/user/pending', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send();
    }

    if (!req.user.admin) {
      return res.status(403).send();
    }

    const userFilter = { pending: true };

    User.find(userFilter)
      .then((users) => {
        res.send(users);
      });
  });

  app.get('/api/user/allowed', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send();
    }

    if (!req.user.admin) {
      return res.status(403).send();
    }

    const userFilter = { pending: false, permitted: true };

    User.find(userFilter)
      .then((users) => {
        res.send(users);
      });
  });

  app.get('/api/user/disallowed', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send();
    }

    if (!req.user.admin) {
      return res.status(403).send();
    }

    const userFilter = { pending: false, permitted: false };

    User.find(userFilter)
      .then((users) => {
        res.send(users);
      });
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
