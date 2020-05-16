import mongoose from "mongoose";
import Bluebird from "bluebird";
import ServerConfiguration from "../config/server_configuration";
import logger from "../servers/shared/log";
mongoose.Promise = Bluebird;

mongoose.connection.on("error", (err) => {
  throw err;
});
mongoose.set("useFindAndModify", false);

const mongoUrl: string =
  `mongodb://${ServerConfiguration.database.host}:${ServerConfiguration.database.port}/` +
  `${ServerConfiguration.database.data}`;

const mongoOptions = { useUnifiedTopology: true, useNewUrlParser: true };

export = (): Promise<typeof mongoose> => {
  logger.info(`Connecting to mongo server ${mongoUrl}`);
  return mongoose.connect(mongoUrl, mongoOptions);
};
