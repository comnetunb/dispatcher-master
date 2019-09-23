import nodemailer from 'nodemailer';
import * as Config from './configuration';
import logger from './log';
import Mail from 'nodemailer/lib/mailer';

const config = Config.getConfiguration();

const transporter = nodemailer.createTransport({
  service: config.transporter.service,
  auth: {
    user: config.transporter.auth.user,
    pass: config.transporter.auth.password,
  }
});

export function sendMail(to: string, subject: string, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const mailOptions: Mail.Options = {
      from: config.transporter.auth.user,
      to,
      subject,
      text,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        logger.error(error.message);
        reject(error);
      }
      resolve();
    });
  });
};
