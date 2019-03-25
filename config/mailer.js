
const nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
};
// Use SendGrid Protocol to send Email
const mailSender = nodemailer.createTransport(sgTransport(options),
  { from: process.env.EMAIL_SENDER });

module.exports = {
  mailSender,
};
