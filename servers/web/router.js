/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const passport = require('passport')

const User = rootRequire('database/models/user')

// Routes
const home = rootRequire('servers/web/routes/home')
const login = rootRequire('servers/web/routes/login')
const dashboard = rootRequire('servers/web/routes/dashboard')
const sign_up = rootRequire('servers/web/routes/sign_up')
const simulation = rootRequire('servers/web/routes/simulation')

// APIs
const api_simulation_group = rootRequire('servers/web/apis/simulation_group')
const api_log = rootRequire('servers/web/apis/log')
const api_worker = rootRequire('servers/web/apis/worker')

module.exports.execute = function (app) {
  home(app)
  login(app)
  dashboard(app)
  sign_up(app)
  simulation(app)

  api_simulation_group(app)
  api_log(app)
  api_worker(app)
}

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

module.exports.authenticationMiddleware = function authenticationMiddleware () {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }

    res.redirect('/')
  }
}
