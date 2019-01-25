const utils = require('../utils');

const User = databaseRequire('models/user');
const config = webRequire('config');


function login(req, res) {
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

      res
        .cookie('DISYSBOT_SID', utils.signJWT(user), { maxAge: config.expiresIn })
        .status(200)
        .send({});
    })
    .catch(() => {
      res.status(500).send('An internal error occurred.');
    });
}

function signUp(req, res) {
  const {
    email,
    name,
    password,
    confirmPassword,
  } = req.body;

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
              .cookie('DISYSBOT_SID', utils.signJWT(user), { maxAge: config.expiresIn })
              .status(200)
              .send({});
          });
      });
    })
    .catch(() => {
      res.status(500).send('An internal error occurred. Please try again later.');
    });
}

module.exports = {
  login,
  signUp,
};
