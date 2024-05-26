import Users from "../models/UserModel.js";

// Fungsi untuk mengambil pengguna berdasarkan userId
const getUserById = async (userId) => {
  try {
    return await Users.findOne({
      where: {
        uuid: userId,
      },
    });
  } catch (error) {
    throw new Error("Error retrieving user");
  }
};

// Middleware untuk memverifikasi autentikasi pengguna
export const verifyUser = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
    }
    const user = await getUserById(req.session.userId);
    if (!user) return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
    req.userId = user.id;
    req.role = user.role;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Middleware untuk Akses Hanya Super Admin
export const superAdminOnly = async (req, res, next) => {
  try {
    const user = await getUserById(req.session.userId);
    if (!user) return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
    if (user.role !== "superadmin")
      return res.status(403).json({ msg: "Akses terbatas untuk Super Admin" });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Middleware untuk Akses Hanya Admin
export const adminOnly = async (req, res, next) => {
  try {
    const user = await getUserById(req.session.userId);
    if (!user) return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
    if (user.role !== "admin")
      return res.status(403).json({ msg: "Akses ditolak" });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Middleware untuk Akses Super Admin dan Admin
export const superAdminAndAdmin = async (req, res, next) => {
  try {
    const user = await getUserById(req.session.userId);
    if (!user) return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
    if (user.role === "member")
      return res
        .status(403)
        .json({ msg: "Akses terbatas untuk Super Admin dan Admin" });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
