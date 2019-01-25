const express = require('express');
const utils = require('../utils');

const controller = apiRequire('v1/controllers/auth');

const router = express.Router();

router.route('/login')
  .post(controller.login);

router.route('/signup')
  .post(controller.signUp);

router.route('/is-authenticated')
  .get(utils.verifyJWT, () => res.sendStatus(200));

module.exports = router;
