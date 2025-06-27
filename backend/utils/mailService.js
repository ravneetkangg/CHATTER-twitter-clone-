const nodemailer = require("nodemailer");
require("dotenv").config(); // Load MAIL_USER and MAIL_PASS from .env

// Create nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Send an email using Gmail
const sendEmail = async(to, subject, text) => {
    const mailOptions = {
        from: `"Chatter" <${process.env.MAIL_USER}>`,
        to,
        subject,
        text,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error("Error sending email:", err.message);
        throw err;
    }
};

module.exports = { sendEmail };