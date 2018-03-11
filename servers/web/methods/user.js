
module.exports = function (app, passport) {
  app.post('/sign_in', passport.authenticate('local'), function (req, res) {
    res.json(req.user)
  })

  app.get('/signed_in', function (req, res) {
    res.send(req.isAuthenticated() ? req.user : null)
  })

  app.post('/sign_out', function (req, res) {
    req.logOut()
    res.send(200)
  })
}