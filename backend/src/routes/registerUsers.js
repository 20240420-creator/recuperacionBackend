import express from "express";
import registerUsersController from "../controllers/registerUsersController.js";
import upload from "../utils/cloudinaryConfig.js";

const router = express.Router();

router
  .route("/")
  .post(upload.single("fotoPerfil"), registerUsersController.register);

router
  .route("/verifyCode")
  .post(upload.none(), registerUsersController.verifyCode);

export default router;
