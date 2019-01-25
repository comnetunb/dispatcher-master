
const jwt = require('jsonwebtoken');

const config = webRequire('config');
const User = databaseRequire('models/user');

const verifyJWT = (req, res, next) => {
  const token = req.cookies.DISYSBOT_SID;

  if (!token) {
    res.status(401).send('No token provided.');
    return;
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    try {
      if (err) {
        throw err;
      }

      User
        .findById(decoded.id)
        .then((user) => {
          if (!user) {
            throw Object('Invalid user');
          }

          req.user = user;
          next();
        });
    } catch (err2) {
      res
        .clearCookie('DISYSBOT_SID')
        .status(401)
        .send(`Token verification failed: ${err2}`);
    }
  });
};

const signJWT = (user) => {
  return jwt.sign({ id: user._id }, config.secret, {
    expiresIn: config.expiresIn
  });
};

module.exports = {
  verifyJWT,
  signJWT,
};
