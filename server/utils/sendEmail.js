const nodemailer = require("nodemailer");

// Функция для отправки email
const sendEmail = async (to, verificationCode) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials are not set in environment variables.");
  }

  try {
    // Настройка транспортера
    const transporter = nodemailer.createTransport({
      service: "gmail", // Можно заменить на другой сервис, например, Outlook, SendGrid и т. д.
      auth: {
        user: process.env.EMAIL_USER, // Ваш email
        pass: process.env.EMAIL_PASS, // Ваш пароль или приложение-токен
      },
    });

    // Создание HTML-контента письма
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f7fc;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .email-container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background-color: #007BFF;
              color: #ffffff;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 20px;
              text-align: center;
            }
            .content p {
              font-size: 16px;
              line-height: 1.5;
            }
            .verification-code {
              font-size: 24px;
              font-weight: bold;
              color: #007BFF;
              background-color: #f0f8ff;
              padding: 10px 20px;
              border-radius: 8px;
            }
            .footer {
              text-align: center;
              padding: 10px;
              font-size: 12px;
              color: #777;
              margin-top: 20px;
            }
            .footer a {
              color: #007BFF;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Welcome to Volunteer</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thank you for registering with us. To complete your account verification, please use the following verification code:</p>
              <div class="verification-code">
                ${verificationCode}
              </div>
              <p>This code is valid for the minute. If you did not request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Best regards,</p>
              <p>The Volunteer Team</p>
              <p>If you have any questions, feel free to <a href="mailto:karakozhaev.bektur@gmail.com">contact us</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Настройка письма
    const mailOptions = {
      from: process.env.EMAIL_USER, // От кого письмо
      to, // Кому
      subject: "Volunteer", // Тема письма
      text: `Your verification code is ${verificationCode}`, // Простой текст
      html: htmlContent, // HTML контент
    };

    // Отправка письма
    const info = await transporter.sendMail(mailOptions);

    return info; // Возвращаем результат отправки
  } catch (error) {
    console.error("Error sending email:", error); // Логируем ошибку
    throw new Error(`Error sending email: ${error.message}`);
  }
};

module.exports = sendEmail;
