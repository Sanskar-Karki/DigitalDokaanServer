import express, { Router } from "express";
import categoryController from "../controllers/categoryController";
import userMiddleware, { Role } from "../middleware/userMiddleware";
const router: Router = express.Router();

// category herna lai matra login na huda ni hunxa

router
  .route("/")
  .get(categoryController.getCategory)
  .post(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Admin),
    categoryController.addCategory
  );

// login ra admin huna paryo post, patch ra delete category ko lagi

router
  .route("/:id")
  .patch(userMiddleware.accessTo(Role.Admin), categoryController.updateCategory)
  .delete(
    userMiddleware.accessTo(Role.Admin),
    categoryController.deleteCategory
  );

export default router;
