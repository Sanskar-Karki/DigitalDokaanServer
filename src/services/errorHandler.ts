import { Request, Response } from "express";

// making a error handler wrapper HOF

export default function errorHandler(fn: Function) {
  return (req: Request, res: Response) => {
    fn(req, res).catch((err: Error) => {
      res.status(500).json({
        message: "Internal error",
        errorMessage: err.message,
      });
      return;
    });
  };
}
