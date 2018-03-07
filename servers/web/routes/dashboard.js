/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const router = rootRequire('servers/web/router')
const Worker = rootRequire('database/models/worker')

module.exports = function (app) {
  // dashboard
  app.get('/dashboard/executing-simulation-groups', router.authenticationMiddleware(), function (req, res) {
    const options = { title: 'Dashboard' }

    res.render('dashboard/executing-simulation-groups', options)
  })

  app.get('/dashboard/finished-simulation-groups', router.authenticationMiddleware(), function (req, res) {
    const options = { title: 'Dashboard' }

    res.render('dashboard/finished-simulation-groups', options)
  })

  app.get('/dashboard/new-simulation-group', router.authenticationMiddleware(), function (req, res) {
    const options = { title: 'Dashboard' }

    res.render('dashboard/new-simulation-group', options)
  })

  app.get('/dashboard/workers', /*router.authenticationMiddleware(),*/ function (req, res) {
    res.render('dashboard/worker')
  })

  app.get('/dashboard/logs', function (req, res) {
    const options = { title: 'Dashboard' }

    res.render('dashboard/logs', options)
  })

  app.get('/worker', function (req, res) {
    res.render('dashboard/worker')
  })

  app.get('/workers', function (req, res) {
    Worker
      .find({})
      .then(function (workers) {
        res.send(workers)
      })
  })
}
