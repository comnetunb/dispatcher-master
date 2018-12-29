const User = databaseRequire('models/user');
const config = rootRequire('api/config');

module.exports = (app) => {
  app.post('/api/v1/auth/signup', (req, res) => {
    const { email, name, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      res.status(409).send('Passwords mismatched.');
      return;
    }

    User
      .count({ email })
      .then((count) => {
        if (count > 0) {
          res.status(409).send('User already exists.');
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

              res
                .cookie('DISYSBOT_SID', signJWT(user), { maxAge: config.expiresIn })
                .status(200)
                .send({});
            });
        });
      })
      .catch(() => {
        res.status(500).send('An internal error occurred. Please try again later.');
      });
  });
};
