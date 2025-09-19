const crypto = require("crypto");
const transporter = require("../config/mailer");

const generate2FACode = () => crypto.randomInt(100000, 999999).toString();

const send2FAEmail = async (email, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔐 Code de vérification",
    html: `
      <div style="font-family: Arial; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2>Code de Vérification</h2>
        <div style="background: #007bff; color: white; padding: 20px; text-align: center; font-size: 28px; border-radius: 8px;">
          ${code}
        </div>
        <p>Ce code expire dans <strong>5 minutes</strong>.</p>
      </div>
    `,
  });
};

module.exports = { generate2FACode, send2FAEmail };
