const nodemailer = require('nodemailer');
require('dotenv').config();

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ SMTP credentials missing from environment variables');
  console.error('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
  console.error('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
  throw new Error('Missing SMTP credentials in environment variables');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP configuration error:', error.message);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

async function sendTaskNotification({ to, subject, text, html }) {
  try {
    console.log(`📧 Sending email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    const info = await transporter.sendMail({
      from: `"Task Manager" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });
    
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
}

module.exports = { sendTaskNotification };