import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Cars = db.define(
  "car",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [0, 100],
      },
    },
    rentPerDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    images: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    is_deleted: {
      type: DataTypes.INTEGER,
    },
    createdBy: {
      type: DataTypes.INTEGER,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
    },
    deletedBy: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);

// Menyesuaikan hubungan antara model Cars dan Users
Cars.belongsTo(Users, { foreignKey: "userId" });
Cars.belongsTo(Users, { foreignKey: "createdBy", as: "createdByUser" });
Cars.belongsTo(Users, { foreignKey: "updatedBy", as: "updatedByUser" });
Cars.belongsTo(Users, { foreignKey: "deletedBy", as: "deletedByUser" });

// Menambahkan hubungan hasMany dari Users ke Cars
Users.hasMany(Cars);

export default Cars;
