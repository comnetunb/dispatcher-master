/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const mongoose = require('mongoose');

mongoose.connection.on('error', (err) => {
  throw err;
});

const mongoUrl = 'mongodb://localhost/ons';
const mongoOptions = { useMongoClient: true };

module.exports = () => {
  mongoose.Promise = require('bluebird'); // eslint-disable-line global-require
  return mongoose.connect(mongoUrl, mongoOptions);
};
