import nodemailer from "nodemailer";
import logger from "./log";
import Mail from "nodemailer/lib/mailer";
import Configuration from "../../database/models/configuration";

export async function sendMail(
  to: string,
  subject: string,
  text: string
): Promise<void> {
  let config = await Configuration.get();
  if (!config.emailService) {
    throw "No email service is set";
  }
  if (!config.emailUser) {
    throw "No email user is set";
  }
  if (!config.emailPassword) {
    throw "No email password is set";
  }

  const transporter = nodemailer.createTransport({
    service: config.emailService,
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });

  const mailOptions: Mail.Options = {
    from: config.emailUser,
    to,
    subject,
    text,
  };

  let promise = new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        logger.error(error.message);
        reject(error);
      }
      resolve();
    });
  });
  await promise;
}
