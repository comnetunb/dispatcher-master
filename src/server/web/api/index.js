/* eslint global-require: 0 */
const express = require('express');

const v1router = apiRequire('v1/routers');

const router = express.Router();

router.use(require('cookie-parser')());
router.use(require('body-parser').json());
router.use(require('body-parser').urlencoded({ extended: true }));
router.use(require('cors')({ credentials: true, origin: true }));

router.use('/v1', v1router);

module.exports = router;
