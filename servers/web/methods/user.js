
const User = rootRequire('database/models/user')

module.exports = function (app, passport) {
  app.post('/sign_in', passport.authenticate('local'), function (req, res) {
    res.json(req.user)
  })

  app.get('/signed_in', function (req, res) {
    res.send(req.isAuthenticated() ? req.user : null)
  })

  app.post('/sign_out', function (req, res) {
    req.logOut()
    res.sendStatus(200)
  })

  app.post('/sign_up', function (req, res) {
    const userFilter = { email: req.body.email }

    User
      .findOne(userFilter)
      .then(function (user) {
        if (user) {
          res.status(409).send({ reason: 'User already exists.' })
          return
        }

        const email = req.body.email
        const name = req.body.username
        const password = req.body.password

        User
          .encryptPassword(password, function (e, hash) {
            if (e) {
              throw e
            }

            const newUser = new User({
              email: email,
              name: name,
              password: hash
            })

            newUser
              .save()
              .catch(function (e) {
                res.status(500).send({ reason: 'An internal error occurred. Please try again later.' })
              })
          })

      }).catch(function (e) {
        res.status(500).send({ reason: 'An internal error occurred. Please try again later.' })
      })
  })
}