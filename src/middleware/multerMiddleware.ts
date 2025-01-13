import { Request } from "express";
import multer from "multer";

// multer vaneko cai a middleware package for diles with contentType:multipart/formdata
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: any) {
    cb(null, "./src/uploads");
  },
  filename: function (req: Request, file: Express.Multer.File, cb: any) {
    cb(null, "img" + "_" + file.originalname);
  },
});

export { multer, storage };
