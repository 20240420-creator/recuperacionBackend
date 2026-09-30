import nodemailer from "nodemailer";
import crypto from "crypto";
import bcryptjs from "bcryptjs";

import usersModel from "../models/usersModel.js";
import { config } from "../../config.js";

const registerUsersController = {};

registerUsersController.register = async (req, res) => {
  try {
    let { nombre, apellido, email, password, telefono, fechaNacimiento } = req.body;

    if (!nombre || !apellido || !email || !password || !telefono || !fechaNacimiento){
      return res.status(400).json({ message: "Campos obligatorios" });
    }

    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ message: "Correo Invalido" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Contraseña al menos de 8 caracteres" });
    }

    const existsUser = await usersModel.findOne({ email });
    if (existsUser) {
      return res.status(400).json({ message: "Correo registrado anteriormente, Es decir ya existe" });
    }

    const passwordHashed = await bcryptjs.hash(password, 10);

    const randomCode = crypto.randomBytes(3).toString("hex");

    const codigoExpira = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = new usersModel({
      nombre,
      apellido,
      email,
      password: passwordHashed,
      telefono,
      fechaNacimiento,
      fotoPerfil: req.file.path,
      cloudinaryPublicId: req.file.filename,
      codigoVerificacion: randomCode,
      codigoExpira,
      isVerified: false,
    });

    await newUser.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.user_email,
        pass: config.email.user_password,
      },
    });

    const mailOptions = {
      from: config.email.user_email,
      to: email,
      subject: "Verificación de cuenta",
      text:
        "Para verificar tu cuenta, utiliza este código " +
        randomCode +
        " expira en 15 minutos",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error sending email" });
      }

      return res.status(200).json({ message: "Email sent" });
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerUsersController.verifyCode = async (req, res) => {
  try {
    const { email, codigoVerificacion } = req.body;

    if (!email || !codigoVerificacion) {
      return res.status(400).json({ message: "Campos obligatorios" });
    }

    const userFound = await usersModel.findOne({ email });

    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userFound.codigoExpira || userFound.codigoExpira < new Date()) {
      return res.status(400).json({ message: "Codigo expirado" });
    }

    if (codigoVerificacion !== userFound.codigoVerificacion) {
      return res.status(400).json({ message: "Codigo invalido" });
    }

    userFound.isVerified = true;
    await userFound.save();

    return res.status(200).json({ message: "Usuario verificado" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerUsersController;
