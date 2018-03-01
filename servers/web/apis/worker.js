/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const interfaceManager = rootRequire('servers/shared/interface_manager')

module.exports = function (app) {
  app.post('/api/worker/pause', function (req, res) {
    console.log('pause')
    interfaceManager.pauseWorker(req.body.address)
  })

  app.post('/api/worker/resume', function (req, res) {
    console.log('resume')
    interfaceManager.resumeWorker(req.body.address)
  })

  app.post('/api/worker/stop', function (req, res) {
    console.log('stop')
    interfaceManager.stopWorker(req.body.address)
  })
}