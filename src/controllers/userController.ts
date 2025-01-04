import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
class UserController {
  static async register(req: Request, res: Response) {
    //incoming user data receive
    const { username, email, password } = req.body;
    console.log(req.body);
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
}
export default UserController;
