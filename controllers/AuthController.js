import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).json({ msg: "Email not found" });
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    req.session.userId = user.uuid;
    const uuid = user.uuid;
    const name = user.name;
    const email = user.email;
    const role = user.role;

    const accessToken = jwt.sign(
      { uuid, name, email, role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "40s",
      }
    );

    const refreshToken = jwt.sign(
      { uuid, name, email, role },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    await Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          uuid: uuid,
        },
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const Me = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
  }
  const user = await Users.findOne({
    attributes: ["uuid", "name", "email", "role"],
    where: {
      uuid: req.session.userId,
    },
  });
  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
  res.status(200).json(user);
};

export const logOut = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  const users = await Users.findAll({
    where: {
      refresh_token: refreshToken,
    },
  });

  // Cek apakah user ditemukan
  if (users.length === 0) return res.sendStatus(204);

  const userId = users[0].id;
  // console.log(users);

  await Users.update(
    { refresh_token: null },
    {
      where: {
        uuid: userId,
      },
    }
  );

  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};
