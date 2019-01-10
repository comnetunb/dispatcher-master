/* eslint global-require: 0 */
const jwt = require('jsonwebtoken');
const express = require('express');

const log = sharedRequire('log');
const config = apiRequire('config');

const User = databaseRequire('models/user');

global.verifyJWT = (req, res, next) => {
  const token = req.cookies.DISYSBOT_SID;

  if (!token) {
    res.status(401).send('No token provided.');
    return;
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    try {
      if (err) {
        throw err;
      }

      User
        .findById(decoded.id)
        .then((user) => {
          if (!user) {
            throw Object('Invalid user');
          }

          req.user = user;
          next();
        });
    } catch (err2) {
      res
        .clearCookie('DISYSBOT_SID')
        .status(401)
        .send(`Token verification failed: ${err2}`);
    }
  });
};

global.signJWT = (user) => {
  return jwt.sign({ id: user._id }, config.secret, {
    expiresIn: config.expiresIn
  });
};

const apis = {
  auth: {
    login: require('./v1/auth/login'),
    signUp: require('./v1/auth/signup'),
    isAuthenticated: require('./v1/auth/is-authenticated')
  },
  admin: {
    taskSet: {
      running: require('./v1/admin/task-set/running'),
      finished: require('./v1/admin/task-set/finished'),
      delete: require('./v1/admin/task-set/delete')
    },
    slave: {
      slave: require('./v1/admin/slave/slave'),
      command: require('./v1/admin/slave/command')
    },
    log: {
      log: require('./v1/admin/sys-log/sys-log')
    },
    settings: {
      settings: require('./v1/admin/settings/settings')
    }
  }
};

const app = express();

app.use(require('cookie-parser')());
app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cors')({ credentials: true, origin: true }));

const walk = (obj, cb) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  log.info(`API listening on port ${PORT}`);
});
