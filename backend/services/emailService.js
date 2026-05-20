const nodemailer = require("nodemailer");

const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {

      user: process.env.EMAIL_USER,

      pass: process.env.EMAIL_PASS

    }

  });

const sendRecommendationEmail =
async (
  to,
  weakTopic
) => {

  const mailOptions = {

    from: process.env.EMAIL_USER,

    to,

    subject:
      "AI Learning Recommendation",

    html: `

      <h2>AI Mentor Recommendation 🚀</h2>

      <p>
      You are weak in:
      <strong>${weakTopic}</strong>
      </p>

      <ul>
        <li>Revise core concepts</li>
        <li>Practice interview questions</li>
        <li>Build mini projects</li>
      </ul>

    `

  };

  await transporter.sendMail(
    mailOptions
  );
};

module.exports = {
  sendRecommendationEmail
};