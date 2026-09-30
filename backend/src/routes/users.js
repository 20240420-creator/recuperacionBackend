import express from "express";
import usersController from "../controllers/usersController.js";
import upload from "../utils/cloudinaryConfig.js";

const router = express.Router();

router.route("/").get(usersController.getUsers);

router
  .route("/:id")
  .put(upload.single("fotoPerfil"), usersController.updateUser)
  .delete(usersController.deleteUser);

export default router;
