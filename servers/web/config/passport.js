
const LocalStrategy = require('passport-local').Strategy

const User = rootRequire('database/models/user')

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User
      .findById(id)
      .then(function (user) {
        done(null, user)
      })
      .catch(function (e) {
        done(e, false)
      })
  });

  passport.use(new LocalStrategy(function (email, password, done) {
    User
      .findOne({ email: email.toLowerCase() })
      .then(function (user) {
        if (!user) {
          return done(null, false, { message: 'User not found' })
        }

        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Password do not match' })
        }

        user.password = undefined

        // Success
        return done(null, user)
      })
      .catch(function (e) {
        return done(e, false, { message: 'An internal error occurred. Please try again later' })
      })
  }))
}