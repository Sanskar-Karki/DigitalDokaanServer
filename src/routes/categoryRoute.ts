import express, { Router } from "express";
import categoryController from "../controllers/categoryController";
import userMiddleware from "../middleware/userMiddleware";
const router: Router = express.Router();

// category herna lai matra login na huda ni hunxa

router
  .route("/")
  .get(categoryController.getCategory)
  .post(userMiddleware.isUserLoggedIn, categoryController.addCategory);

// login ra admin huna paryo post, patch ra delete category ko lagi

router
  .route("/:id")
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

export default router;
