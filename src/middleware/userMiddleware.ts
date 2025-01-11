import { NextFunction, Request, Response } from "express";
import { envConfig } from "../config/config";
import jwt from "jsonwebtoken";
import User from "../database/models/userModel";

export enum Role {
  Admin = "admin",
  Customer = "customer",
}
interface IExtendedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
  };
}

class UserMiddleware {
  async isUserLoggedIn(
    req: IExtendedRequest,
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
    jwt.verify(
      token,
      envConfig.jwtSecretKey as string,
      async (err, result: any) => {
        if (err) {
          res.status(403).json({
            message: "Invalid token!!!",
          });
        } else {
          // console.log(result); // {userId:131239} tyo generate vako token ko object ma value aunxa
          const userData = await User.findByPk(result.userId); //{email:"",pass:"",role:""}
          if (!userData) {
            res.status(404).json({
              message: "No user with that userId",
            });
            return;
          }
          req.user = userData;
          next();
        }
      }
    );
  }

  // category add admin le matra garna parunu paryo customer ley paunu vayena
  accessTo(...roles: Role[]) {
    return (req: IExtendedRequest, res: Response, next: NextFunction) => {
      let userRole = req.user?.role as Role;
      if (!roles.includes(userRole)) {
        res.status(403).json({
          message: "Customers dont have authority to add Category",
        });
        return;
      }
      next();
      console.log(userRole, "Role");
    };
  }
}

export default new UserMiddleware();
