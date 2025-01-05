import nodemailer from "nodemailer";
import { envConfig } from "../config/config";

interface Idata {
  to: string;
  subject: string;
  text: string;
}

const sendMail = async (data: Idata) => {
  // configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: envConfig.email,
      pass: envConfig.appPass, //gmail ko haina app password (mail pathauna matra use hune pass) diney
    },
  });
  const mailOptions = {
    from: "Digital Dokaan<digitaldokaan20@gmail.com>",
    to: data.to,
    subject: data.subject,
    text: data.text,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failerd to send email", err);
    throw err;
  }
};

export default sendMail;
