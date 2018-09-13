/* eslint global-require: 0 */
global.jwt = require('jsonwebtoken');

const express = require('express');
const cors = require('cors');

const log = rootRequire('servers/shared/log');

const config = rootRequire('api/config');

const apis = {
  auth: {
    login: require('./v1/auth/login'),
    signUp: require('./v1/auth/signup'),
  },
  admin: {
    taskSet: {
      running: require('./v1/admin/task-set/running'),
      finished: require('./v1/admin/task-set/finished'),
      delete: require('./v1/admin/task-set/delete'),
    },
    slave: {
      slave: require('./v1/admin/slave/slave'),
      command: require('./v1/admin/slave/command'),
    },
    log: {
      log: require('./v1/admin/sys-log/sys-log')
    }
  }
};

const app = express();

app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: true }));

app.use(cors());

const walk = (obj, cb) => {
  Object.keys(obj).forEach((key) => {
    if (Object.keys(obj[key]).length > 0) {
      walk(obj[key], cb);
    } else {
      cb(obj[key]);
    }
  });
};

module.exports = () => {
  walk(apis, (api) => {
    api(app);
  });
};

global.verifyJWT = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    res.status(401).send('No token provided.');
    return;
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      res.status(401).send(`Token verification failed: ${err.message}`);
      return;
    }

    req.userId = decoded.id;

    next();
  });
};

global.signJWT = (user) => {
  return jwt.sign({ id: user._id }, config.secret, {
    expiresIn: config.expiresIn
  });
};

const PORT = 80;

app.listen(PORT, () => {
  log.info(`API listening on port ${PORT}`);
});
