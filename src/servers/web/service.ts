import express from 'express';
import proxy from 'http-proxy-middleware';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import indexRouter from './routers/index.router';
import User, { IUser, IUserDocument } from '../../database/models/user';
import { auth } from './middlewares/auth';

// Extending Request to properly type our users
declare global {
  namespace Express {
    interface Request {
      user?: IUser
      token?: string,
      adminMode?: boolean,
    }
    interface Response {
      user?: IUser,
      token?: string,
    }
  }
}

const app: express.Application = express();

app.use(bodyParser.json({ limit: '50mb' })); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());

// New hostname+path as specified by question:
const apiProxy = proxy('**', { target: 'http://localhost:4200' });

app.use('/api', auth);
app.use('/api', indexRouter);
app.use(apiProxy);

export = () => {
  app.listen(8080, '0.0.0.0');
};
