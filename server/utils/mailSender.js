const nodemailer = require("nodemailer");
const generateWelcomeEmail = require("../mail/templates/welcomeEmail");
require('dotenv').config()


const mailSender = async (email, title, body) => {
    try {
        // Create a transporter
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // Send mail
        let info = await transporter.sendMail({
            from: `"${process.env.MAIL_USERNAME}" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
        });

        console.log("Email info: ", info);
        return info;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
};

const sendWelcomeEmail = async ({ email, firstName, rollNumber, password }) => {
    try {
        const emailBody = generateWelcomeEmail({ firstName, rollNumber, password });
        const info = await mailSender(
            email,
            "Welcome to Our Institute - Your Login Credentials",
            emailBody
        );
        return info;
    } catch (error) {
        console.log("Error in sending welcome email:", error);
        throw error;
    }
};

module.exports = { mailSender, sendWelcomeEmail };