
const setup = rootRequire('servers/web/setup')
const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'));

//Passport
const passport = require('passport');
rootRequire('servers/web/config/passport')(passport)

//Cookie and session
const cookieParser = require('cookie-parser');
const session = require('express-session');
app.use(session({
  secret: '4df8jb1arc2r84g',
  resave: false,
  saveUninitialized: false
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

//Body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb'})); //for parsing application/json
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

module.exports = function () {
  app.use('/bootstrap', express.static(__dirname + '/../../node_modules/bootstrap/dist/'));
  app.use('/angular', express.static(__dirname + '/../../node_modules/angular/'));
  app.use('/angular-animate', express.static(__dirname + '/../../node_modules/angular-animate/'));
  app.use('/angular-route', express.static(__dirname + '/../../node_modules/angular-route/'));
  app.use('/angular-utils-pagination', express.static(__dirname + '/../../node_modules/angular-utils-pagination/'));
  app.use('/jquery', express.static(__dirname + '/../../node_modules/jquery/dist/'));
  app.use('/sb-admin', express.static(__dirname + '/../../node_modules/startbootstrap-sb-admin/'));
  app.use('/jquery-easing', express.static(__dirname + '/../../node_modules/jquery.easing/'));
  app.use('/popper', express.static(__dirname + '/../../node_modules/popper.js/dist/'));
  app.use('/dataTables', express.static(__dirname + '/../../node_modules/datatables/media/'));
  app.use('/font-awesome', express.static(__dirname + '/../../node_modules/font-awesome/'));
  app.use('/angular-gridster', express.static(__dirname + '/../../node_modules/angular-gridster/dist'));
  app.use('/angularjs-gauge', express.static(__dirname + '/../../node_modules/angularjs-gauge/dist'));
  app.use('/angularjs-chartjs', express.static(__dirname + '/../../node_modules/angular-chart.js'));
  app.use('/angular-ui-bootstrap', express.static(__dirname + '/../../node_modules/angular-ui-bootstrap/dist'));
  //router(app)

  setup(app, passport)

  // Listen requests
  app.listen(8080, '0.0.0.0')
}