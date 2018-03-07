/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

module.exports = function (app) {
  app.get('/index', (req, res) => {
    res.render('index')
  })
}
