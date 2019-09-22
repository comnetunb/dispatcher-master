import express from 'express';
import serveStatic from 'serve-static';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import indexRouter from './routers/index.router';
import User, { IUser, IUserDocument } from '../../database/models/user';
import { config as passportConfig } from './config/passport';


const app: express.Application = express();

app.use(serveStatic(`${__dirname}/public`));
app.use(bodyParser.json({ limit: '50mb' })); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
passportConfig();

// app.use(session({
//   secret: '4df8jb1arc2r84g',
//   resave: false,
//   saveUninitialized: false
// }));
// app.use(cookieParser());
// app.use(passport.initialize());
// app.use(passport.session());

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

  req.user = myUser;
  next();
});
app.use('/bootstrap', serveStatic(`${__dirname}/../../../node_modules/bootstrap/dist/`));
app.use('/angular', serveStatic(`${__dirname}/../../../node_modules/angular/`));
app.use('/angular-animate', serveStatic(`${__dirname}/../../../node_modules/angular-animate/`));
app.use('/angular-route', serveStatic(`${__dirname}/../../../node_modules/angular-route/`));
app.use('/angular-utils-pagination', serveStatic(`${__dirname}/../../../node_modules/angular-utils-pagination/`));
app.use('/jquery', serveStatic(`${__dirname}/../../../node_modules/jquery/dist/`));
app.use('/sb-admin', serveStatic(`${__dirname}/../../../node_modules/startbootstrap-sb-admin/`));
app.use('/jquery-easing', serveStatic(`${__dirname}/../../../node_modules/jquery.easing/`));
app.use('/popper', serveStatic(`${__dirname}/../../../node_modules/popper.js/dist/`));
app.use('/dataTables', serveStatic(`${__dirname}/../../../node_modules/datatables/media/`));
app.use('/font-awesome', serveStatic(`${__dirname}/../../../node_modules/font-awesome/`));
app.use('/angular-gridster', serveStatic(`${__dirname}/../../../node_modules/angular-gridster/dist`));
app.use('/angularjs-gauge', serveStatic(`${__dirname}/../../../node_modules/angularjs-gauge/dist`));
app.use('/angularjs-chartjs', serveStatic(`${__dirname}/../../../node_modules/angular-chart.js`));
app.use('/angular-ui-bootstrap', serveStatic(`${__dirname}/../../../node_modules/angular-ui-bootstrap/dist`));
app.use('/api', indexRouter);

export = () => {
  app.listen(8080, '0.0.0.0');
};
