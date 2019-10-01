import express from 'express';
import proxy from 'http-proxy-middleware';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import indexRouter from './routers/index.router';
import User, { IUser, IUserDocument } from '../../database/models/user';
import { auth } from './middlewares/auth';

// Extending Request to properly type our users
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser
    token?: string,
  }
  interface Response {
    user?: IUser,
    token?: string,
  }
}

const app: express.Application = express();

app.use(bodyParser.json({ limit: '50mb' })); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());

app.use('/api', (req, res, next) => {
  const myUser = new User({
    _id: '5c45d0255a232615a45d627a',
    email: 'mikaelmmello@gmail.com',
    name: 'Mikael',
    password:
      '$2a$10$GT5p4X.cTo1y5IhGN5fOBu8.roDk.OQsiLYe9lUILUAavtZOiONgi',
    __v: 0,
    permitted: true,
    pending: false,
    admin: true,
  });

  // req.user = myUser;
  next();
});
// New hostname+path as specified by question:
const apiProxy = proxy('**', { target: 'http://localhost:4200' });

app.use('/api', auth);
app.use('/api', indexRouter);
app.use(apiProxy);

export = () => {
  app.listen(8080, '0.0.0.0');
};
