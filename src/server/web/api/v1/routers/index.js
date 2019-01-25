const express = require('express');
const authRouter = require('./auth');
const settingsRouter = require('./settings');
const utils = require('../utils');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/settings', utils.verifyJWT, settingsRouter);

module.exports = router;
