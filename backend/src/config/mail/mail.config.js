// Nodemailer transport. When SMTP creds are absent, falls back to a console "ethereal" logger
// so invoice/notification emails never block the request in dev/demo.
const nodemailer = require('nodemailer');
const config = require('../env');
const logger = require('../../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (config.mail.enabled) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: { user: config.mail.user, pass: config.mail.pass },
    });
    logger.info(`SMTP transport ready (${config.mail.host}:${config.mail.port}).`);
  } else {
    logger.warn('SMTP not configured — emails will be logged to the console instead of sent.');
  }
  return transporter;
};

/**
 * Send an email. Returns { sent:boolean, mock:boolean, messageId? }.
 * @param {{to:string, subject:string, html:string, text?:string, attachments?:Array}} opts
 */
const sendMail = async ({ to, subject, html, text, attachments }) => {
  const t = getTransporter();
  if (!t) {
    logger.info(`[MAIL:mock] → to=${to} | subject="${subject}"`);
    return { sent: false, mock: true };
  }
  const info = await t.sendMail({ from: config.mail.from, to, subject, html, text, attachments });
  return { sent: true, mock: false, messageId: info.messageId };
};

module.exports = { sendMail, isEnabled: () => config.mail.enabled };
