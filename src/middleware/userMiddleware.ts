import { NextFunction, Request, Response } from "express";
import { envConfig } from "../config/config";
import jwt from "jsonwebtoken";

class UserMiddleware {
  async isUserLoggedIn(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // login xa ki xaina vaneko cai token le thapaune
    // receive token
    // sensitive kura haru headers ko throuhg communicate garinxa
    const token = req.headers.authorization;
    if (!token) {
      res.status(403).json({
        message: "Token must be provided",
      });
      return;
    }
    // validate token
    jwt.verify(token, envConfig.jwtSecretKey as string, async (err, result) => {
      if (err) {
        res.status(403).json({
          message: "Invalid token!!!",
        });
      } else {
        console.log(result); // {userId:131239} tyo generate vako token ko object ma value aunxa
        // @ts-ignore
        req.userId = result.userId;
        next();
      }
    });
  }
}

export default new UserMiddleware();
