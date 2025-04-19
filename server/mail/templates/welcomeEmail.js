/**
 * Generates HTML content for welcome email
 * @param {Object} params - Email parameters
 * @param {string} params.firstName - Student's first name
 * @param {string} params.rollNumber - Student's roll number
 * @param {string} params.password - Student's password (email)
 * @returns {string} HTML content for the email
 */
const generateWelcomeEmail = ({ firstName, rollNumber, password }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our Institute</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #4CAF50;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }
            .content {
                padding: 20px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 0 0 5px 5px;
            }
            .credentials {
                background-color: #fff;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
                color: #666;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to Our Institute</h1>
        </div>
        <div class="content">
            <p>Dear ${firstName},</p>
            
            <p>Welcome to our institute! We are excited to have you join our academic community.</p>
            
            <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Roll Number:</strong> ${rollNumber}</p>
                <p><strong>Password:</strong> ${password}</p>
            </div>
            
            <p>Please use these credentials to log in to your student portal. We recommend changing your password after your first login for security purposes.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Institute Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </body>
    </html>
    `;
};

module.exports = generateWelcomeEmail; 