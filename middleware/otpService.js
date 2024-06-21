require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 4-digit integer OTP
function generateOTP() {
  const otp = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit integer OTP
  return otp.toString(); // Convert to string if needed for email
}

// Send OTP via Email
async function sendOTP(email, otp) {
  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  generateOTP,
  sendOTP,
};
