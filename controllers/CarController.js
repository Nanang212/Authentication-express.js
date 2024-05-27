import { response } from "express";
import Cars from "../models/CarsModel.js";
import Users from "../models/UserModel.js";
import path from "path";
import fs from "fs";

const saveImg = (image) => {
  if (!image || !image.name || !image.data) {
    throw new Error("Invalid image object");
  }

  const imgPath = path.join(__dirname, "../public/uploads", image.name);
  fs.writeFileSync(imgPath, image.data);
  return `../public/uploads/${image.name}`;
};

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const getCars = async (req, res) => {
  try {
    // Mengambil daftar mobil dari database
    let response;
    response = await Cars.findAll({
      attributes: [
        "id",
        "uuid",
        "model",
        "rentPerDay",
        "images",
        "is_deleted",
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Users,
          as: "createdByUser", // Gunakan alias yang telah ditentukan
          attributes: ["id", "uuid", "name", "email", "role"],
        },
        {
          model: Users,
          as: "updatedByUser", // Gunakan alias yang telah ditentukan
          attributes: ["id", "uuid", "name", "email", "role"],
        },
        {
          model: Users,
          as: "deletedByUser", // Gunakan alias yang telah ditentukan
          attributes: ["id", "uuid", "name", "email", "role"],
        },
      ],
    });

    // Mengembalikan daftar mobil
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getCarById = async (req, res) => {
  try {
    const car = await Cars.findOne({
      where: {
        uuid: req.params.id,
        is_deleted: 0,
      },
    });

    if (!car) return res.status(404).json({ msg: "Data tidak ditemukan" });
    let response;
    response = await Cars.findOne({
      where: {
        id: car.id,
      },
      include: [
        {
          model: Users,
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createCar = async (req, res) => {
  const { model, rentPerDay } = req.body;
  const imageName = req.file.path;
  try {
    await Cars.create({
      model: model,
      rentPerDay: rentPerDay,
      images: imageName,
      userId: req.userId,
      createdBy: req.userId,
      is_deleted: 0, // Set is_deleted ke 0 saat menambahkan mobil baru
    });
    res.status(201).json({ msg: "Car Created Successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log("Error:", error);
  }
};

export const updateCar = async (req, res) => {
  try {
    const car = await Cars.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!car) return res.status(404).json({ msg: "Data tidak ditemukan" });

    const { model, rentPerDay } = req.body;

    // Update gambar jika tersedia
    if (req.file && req.file.filename) {
      const imageUrl = req.file.path;
      car.images = imageUrl;
    }

    // Periksa role pengguna untuk izin
    if (req.role !== "member") {
      // Lakukan pembaruan mobil
      await Cars.update(
        {
          model,
          rentPerDay,
          images: car.images,
          updatedBy: req.userId, // Set updatedBy ke id pengguna saat ini
        },
        {
          where: {
            uuid: req.params.id,
          },
        }
      );

      res.status(200).json({ msg: "Car updated successfully" });
    } else {
      // Jika pengguna adalah member, kirim respons dengan pesan akses ditolak
      return res.status(403).json({ msg: "Akses ditolak" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const car = await Cars.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!car) return res.status(404).json({ msg: "Data tidak ditemukan" });

    if (req.role !== "superadmin" && req.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Akses hanya untuk Superadmin & Admin" });
    }

    await Cars.update(
      {
        is_deleted: 1,
        deletedBy: req.userId,
      },
      {
        where: {
          id: car.id,
        },
      }
    );

    res.status(200).json({ msg: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
