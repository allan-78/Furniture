const nodemailer = require('nodemailer');

// Create transporter for Mailtrap
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email verification
const sendVerificationEmail = async (user, verificationToken) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Verify Your Email - AegisGear',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ AegisGear</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <h2>Welcome, ${user.firstName}!</h2>
            <p>Thank you for registering with AegisGear. Please verify your email address to activate your account.</p>
            <center>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </center>
            <p style="font-size: 14px; color: #666;">Or copy this link:<br><span style="word-break: break-all;">${verificationUrl}</span></p>
            <p><strong>⏰ This link expires in 24 hours.</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 AegisGear. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Password Reset Request - AegisGear',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #f5576c; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello, ${user.firstName}</h2>
            <p>We received a request to reset your password.</p>
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <p style="font-size: 14px; color: #666;">Or copy this link:<br><span style="word-break: break-all;">${resetUrl}</span></p>
            <p><strong>⏰ This link expires in 10 minutes.</strong></p>
            <p>If you didn't request this, ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 AegisGear. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Welcome to AegisGear! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #38ef7d; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to AegisGear!</h1>
          </div>
          <div class="content">
            <h2>Hello, ${user.firstName}!</h2>
            <p>Your email has been verified successfully!</p>
            <ul>
              <li>🛍️ Browse our helmet collection</li>
              <li>💳 Secure checkout</li>
              <li>📦 Track your orders</li>
              <li>⭐ Leave reviews</li>
            </ul>
            <center>
              <a href="${process.env.FRONTEND_URL}/products" class="button">Start Shopping</a>
            </center>
            <p>Stay safe, ride protected! 🏍️</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error(`❌ Welcome email error: ${error.message}`);
    return { success: false };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
