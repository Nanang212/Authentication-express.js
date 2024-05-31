import { Sequelize } from "sequelize";

const db = new Sequelize('auth-jwt-1', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

export default db;