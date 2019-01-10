/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const mongoose = require('mongoose');

mongoose.connection.on('error', (err) => {
  throw err;
});

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DATABASE_NAME
} = process.env;

const auth = MONGO_USERNAME && MONGO_PASSWORD ? `${MONGO_USERNAME}:${MONGO_PASSWORD}` : "";
const mongoUrl = `mongodb://${auth}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DATABASE_NAME}?authSource=admin`;
const mongoOptions = { useMongoClient: true };

module.exports = () => {
  mongoose.Promise = require('bluebird'); // eslint-disable-line global-require
  return mongoose.connect(mongoUrl, mongoOptions);
};
