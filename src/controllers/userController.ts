import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
import generateToken from "../services/generateToken";
import generateOtp from "../services/generateOTP";
import sendMail from "../services/sendMail";
import findData from "../services/findData";
import sendResponse from "../services/sendResponse";
import checkOtpExpiration from "../services/checkOtpExipiration";
class UserController {
  static async register(req: Request, res: Response) {
    // paila receive incoming user data
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        res.status(400).json({
          message: "Please provide username,email,password",
        });
        return;
      }
      // check wheather that email already exist
      const [data] = await User.findAll({
        where: {
          email: email,
        },
      });
      if (data) {
        res.status(400).json({
          message: "Please try again later !!!",
          // Email already exist vanera message diyo vane hacker lai sajilo hunxa messge pauna ra brute force garna lai
        });
        return;
      }
      // data --> users table ma insert garne
      await User.create({
        username,
        email,
        password: bcrypt.hashSync(password, 12),
      });
      res.status(201).json({
        message: "User registered successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Somethign went wrong during registariton ",
        error,
      });
    }
  }
  static async login(req: Request, res: Response) {
    // first take data form user --> email, password
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({
          message: "Please provide email,password",
        });
        return;
      }
      // then email exist or not check garne ,
      // user data array ma return hunxa
      const [user] = await User.findAll({
        //user array is destructured now it is object
        where: {
          email: email,
        },
      });
      // if exist --> check password
      if (!user) {
        res.status(404).json({
          message: " No user with that email 😭",
        });
      } else {
        const isEqual = bcrypt.compareSync(password, user.password);
        if (!isEqual) {
          res.status(400).json({
            message: "Invalid password 😭",
          });
        } else {
          // if password is correct --> generate token (jwt)
          const token = generateToken(user.id);
          res.status(200).json({
            message: "Logged in Successfully 😍",
            token,
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        message: "Error durin login ,error",
      });
    }
  }

  // Password reset garnakolagi 3 ta method total ma , handlforgot,verfiation,chagne
  static async handleForgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({
          message: "Please provide email",
        });
        return;
      }
      //tyo email ko user xa ki xaina vanera check garne
      // yo cai more better approach making functional service for finding query in any model, findData(model,query)
      const user = await findData(User, email);
      //user database ma payena vane
      if (!user) {
        res.status(404).json({
          message: "Email not registered!!!",
        });
        return;
      }
      // user payo vane
      // otp generate garera mail ma pathaune
      const opt = generateOtp();

      await sendMail({
        to: email,
        subject: "Digital Dokaan Password Change Request",
        text: `You are receiving this message following your request to RESET DigitalDokaan Password. If you made this request, please enter the 6 digit code on the Email Verification Page : ${opt}`,
      });
      user.otp = opt; //user ko coloumn ma otp rakhne
      user.otpGeneratedTime = Date.now().toString(); // otp generate vako time rakhney
      await user.save();

      res.status(200).json({
        message: "Password reset OTP sent!!!",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error processing forgot passoword request",
        error,
      });
    }
  }
  // otp ra email bata verify garda more optimal hunxa
  static async verifyOtp(req: Request, res: Response) {
    const { otp, email } = req.body;
    if (!otp || !email) {
      // yo cai more scaleable way to write response message through services making functions
      sendResponse(res, 404, "Please provide otp and email");
      return;
    }
    try {
      const user = await findData(User, email);
      if (!user) {
        sendResponse(res, 404, "No user with this email");
        return;
      }
      // tyo email ko user xa vane
      // OTP verify garne aba
      const [data] = await User.findAll({
        where: {
          otp,
          email,
        },
      });

      if (!data) {
        sendResponse(res, 404, "Invalid OTP");
        return;
      }
      // otp expire vako xa ki nai check garne time 1 min (assume)
      checkOtpExpiration(res, data.otpGeneratedTime, 120000);
    } catch (error) {
      sendResponse(res, 500, "Error during OTP verification", error);
    }
  }

  static async resetPassword(req: Request, res: Response) {
    const { newPassword, confirmPassword, email, otp } = req.body;

    if (!newPassword || !confirmPassword || !email || !otp) {
      sendResponse(
        res,
        400,
        "Please provide newPassword, confirmPassword, email, otp"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      sendResponse(res, 400, "newPassword and confirmPassword must be same");
      return;
    }
    try {
      const user = await findData(User, email);
      if (!user) {
        sendResponse(res, 400, "No user with that Email");
        return;
      }
      if (user.otp !== otp) {
        sendResponse(res, 400, "Invalid OTP");
        return;
      }
      // Reset password
      user.password = bcrypt.hashSync(newPassword, 12);
      await user.save();

      sendResponse(res, 200, "Password reset successfully 😍!!!");
    } catch (error) {
      sendResponse(res, 500, "Error during password reset", error);
    }
  }
}
export default UserController;
