const express = require('express');

const controller = apiRequire('v1/controllers/settings');

const router = express.Router();

router.route('/master')
  .get(controller.masterSettings);

router.route('/slave')
  .get(controller.slaveSettings);

router.route('/update')
  .post(controller.updateSettings);

module.exports = router;
