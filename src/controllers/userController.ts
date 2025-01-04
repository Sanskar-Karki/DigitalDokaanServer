import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
import generateToken from "../services/generateToken";
class UserController {
  static async register(req: Request, res: Response) {
    // receive incoming user data
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
  }
  static async login(req: Request, res: Response) {
    // first take data form user --> email, password
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
      const isEqual = bcrypt.compareSync(password,user.password);
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
  }
}
export default UserController;
