import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
import generateToken from "../services/generateToken";
import generateOtp from "../services/generateOTP";
import sendMail from "../services/sendMail";
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
      // data --> users table ma insert garne
      await User.create({
        username,
        email,
        password: bcrypt.hashSync(password, 10),
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
      const [user] = await User.findAll({
        where: {
          email,
        },
      });
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
      console.log(opt);
      await sendMail({
        to: email,
        subject: "Digital Dokaan Password Change Request",
        text: `You are receiving this message following your request to RESET DigitalDokaan Password. If you made this request, please enter the 6 digit code on the Email Verification Page : ${opt}`,
      });
      user.otp = opt; //user ko coloumn ma otp rakhne
      user.optGeneratedTime = Date.now().toString(); // otp generate vako time rakhney
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
}
export default UserController;
