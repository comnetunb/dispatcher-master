import passportLocal from 'passport-local';
import passport from 'passport';
import User, { IUser } from '../../../database/models/user';
import logger from '../../shared/log';

const LocalStrategy = passportLocal.Strategy;

export function config() {
  passport.serializeUser((user: IUser, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    User
      .findById(id)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        logger.error(error);
        done(error, false);
      });
  });

  passport.use(new LocalStrategy((email: string, password: string, done) => {
    User
      .findOne({ email: email.toLowerCase() })
      .then((user) => {
        if (!user) {
          return done({ error: 'User not found.' });
        }

        if (!user.validPassword(password)) {
          return done({ error: 'Wrong password.' });
        }

        if (!user.permitted || user.pending === true) {
          return done({ error: 'A system administrator must allow your access.' });
        }

        user.password = undefined;

        // Success
        return done(null, user);
      })
      .catch((e) => {
        return done(e, false);
      });
  }));
}
