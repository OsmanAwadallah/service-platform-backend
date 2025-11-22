const nodemailer = require('nodemailer');

const getTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const sendMail = async ({ to, subject, text, html }) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"No Reply" <no-reply@example.com>',
    to,
    subject,
    text,
    html
  });
  if (nodemailer.getTestMessageUrl && info) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
  return info;
};

module.exports = { sendMail };