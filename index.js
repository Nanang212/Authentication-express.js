import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import connectSessionSequelize from "connect-session-sequelize";
import db from "./config/Database.js";
import UserRoute from "./routes/UserRoute.js";
import CarRoute from "./routes/CarRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import Users from "./models/UserModel.js";
import Car from "./models/CarsModel.js";

dotenv.config();
const app = express();

const sessionStore = connectSessionSequelize(session.Store);
const store = new sessionStore({
  db: db,
});

try {
  await db.authenticate();
  console.log("Database Connected..");

  // Sync semua model dengan database
  await db.sync(); // Gunakan db.sync({ force: true }) untuk menghapus tabel lama dan membuat yang baru

  console.log("All models were synchronized successfully.");
} catch (error) {
  console.error(error);
}

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: "auto",
    },
  })
);
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(UserRoute);
app.use(CarRoute);
app.use(AuthRoute);

app.listen(5000, () => console.log("running server"));
