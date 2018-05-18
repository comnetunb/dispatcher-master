/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const nodemailer = require('nodemailer');

const config = rootRequire('servers/shared/configuration').getConfiguration();
const log = rootRequire('servers/shared/log');

const transporter = nodemailer.createTransport({
  service: config.transporter.service,
  auth: {
    user: config.transporter.auth.user,
    pass: config.transporter.auth.pass
  }
});

module.exports.sendMail = (to, subject, text, attachments) => {
  const mailOptions = {
    from: config.transporter.auth.user,
    to,
    subject,
    text,
    attachments
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      log.error(error);
    }
  });
};
