global.jwt = require('jsonwebtoken');

const express = require('express');
const cors = require('cors');

const log = rootRequire('servers/shared/log');

const config = rootRequire('api/config');

const login = require('./v1/auth/login');
const signUp = require('./v1/auth/signup');
const running = require('./v1/admin/task-set/running');
const finished = require('./v1/admin/task-set/finished');
const del = require('./v1/admin/task-set/delete');
const slave = require('./v1/admin/slave/slave');

const app = express();

app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: true }));

app.use(cors());

module.exports = () => {
  login(app);
  signUp(app);
  running(app);
  finished(app);
  del(app);
  slave(app);
};

global.verifyJWT = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    res.status(401).json({ reason: 'No token provided.' });
    return;
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      res.status(500).json({ reason: 'Failed to authenticate token.' });
      return;
    }

    req.userId = decoded.id;

    next();
  });
}

global.signJWTUser = (user) => {
  return jwt.sign({ id: user._id }, config.secret, {
    expiresIn: config.expiresIn
  });
}

const PORT = 80;

app.listen(PORT, () => {
  log.info(`API listening on port ${PORT}`);
});
