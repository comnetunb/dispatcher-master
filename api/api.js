global.jwt = require('jsonwebtoken');

const express = require('express');
const cors = require('cors');

const log = rootRequire('servers/shared/log');

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

const PORT = 80;

app.listen(PORT, () => {
  log.info(`API listening on port ${PORT}`);
});
