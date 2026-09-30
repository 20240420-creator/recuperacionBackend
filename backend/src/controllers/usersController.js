import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import usersModel from "../models/usersModel.js";

const usersController = {};

usersController.getUsers = async (req, res) => {
  try {
    const users = await usersModel.find();
    return res.status(200).json(users);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


usersController.updateUser = async (req, res) => {
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

    const userFound = await usersModel.findById(req.params.id);

    if (!userFound) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const existsUser = await usersModel.findOne({ email });

    
    if (existsUser && existsUser._id.toString() !== req.params.id) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    const passwordHashed = await bcryptjs.hash(password, 10);

    const updatedData = {
      nombre,
      apellido,
      email,
      password: passwordHashed,
      telefono,
      fechaNacimiento,
    };

    if (req.file) {
      await cloudinary.uploader.destroy(userFound.cloudinaryPublicId);

      updatedData.fotoPerfil = req.file.path;
      updatedData.cloudinaryPublicId = req.file.filename;
    }

    const userUpdated = await usersModel.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true },
    );

    if (!userUpdated) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario actualizado" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

usersController.deleteUser = async (req, res) => {
  try {
    const userFound = await usersModel.findById(req.params.id);

    if (!userFound) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await cloudinary.uploader.destroy(userFound.cloudinaryPublicId);

    await usersModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default usersController;
