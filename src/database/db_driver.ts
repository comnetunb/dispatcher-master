import mongoose from 'mongoose';
import Bluebird from "bluebird";
(<any>mongoose).Promise = Bluebird;

mongoose.connection.on('error', (err) => {
  throw err;
});

const mongoUrl: string = 'mongodb://localhost/ons';
const mongoOptions = { useUnifiedTopology: true, useNewUrlParser: true };
mongoose.set('useFindAndModify', false);

export = (): Promise<typeof mongoose> => {
  return mongoose.connect(mongoUrl, mongoOptions);
};
