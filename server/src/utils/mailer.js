const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSKEY,
      },
    });
  }

  // General function to send an email with customizable subject and text
  async sendMail(to, subject, text) {
    const mailOptions = {
      from: process.env.EMAIL, // Sender's email address
      to, // Recipient's email address
      subject, // Email subject
      text, // Email content
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.response); // debug code
      return info;
    } catch (error) {
      console.error("Error sending email:", error); // debug code
      throw new Error("Failed to send email.");
    }
  }

  // Specialized function to send a password reset code
  async sendPasswordResetCode(to, resetCode) {
    const subject = "Password Reset Code";
    const text = `Your password reset code is: ${resetCode}`;
    return await this.sendMail(to, subject, text);
  }
}

module.exports = Mailer;
