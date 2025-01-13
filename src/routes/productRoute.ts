import express, { Router } from "express";
import productController from "../controllers/productController";
import userMiddleware, { Role } from "../middleware/userMiddleware";
import { multer, storage } from "../middleware/multerMiddleware";
const upload = multer({
  storage: storage,
});
const router: Router = express.Router();

router
  .route("/")
  .post(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Admin),
    upload.single("productImage"),
    productController.createProduct
  )
  .get(productController.getAllProduct);
  
router
  .route("/:id")
  .delete(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Admin),
    productController.deleteProduct
  )
  .get(productController.getSingleProduct);

export default router;
