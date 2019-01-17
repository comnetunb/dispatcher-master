const path = require('path');
const express = require('express');
const history = require('connect-history-api-fallback');
const session = require('express-session');
const config = require('./config');
const apiRouter = require('./api');

const log = sharedRequire('log');

const port = process.env.PORT || 8080;
const app = express();

app.use('/ok', (req, res, next) => {res.send('oi')});
app.use('/api', apiRouter);

// handle fallback for HTML5 history API
app.use(history());
// serve pure static assets
const staticPath = path.join(__dirname, '/client');
app.use('/', express.static(staticPath));
app.use('/favicon.ico', express.static(path.join(staticPath, '/favicon.ico')));
app.use('/static', express.static(path.join(staticPath, '/static')));

app.use(session({ secret: config.secret, resave: false, saveUninitialized: false }));

let _resolve = () => {};
const readyPromise = async function readyPromise(resolve) {
  _resolve = resolve;
};

let server;
const start = () => {
  log.info(`Express server listening on port ${port}`);
  server = app.listen(port);
  _resolve();
};

module.exports = {
  start,
  ready: readyPromise,
  close: () => {
    server.close();
  }
};
