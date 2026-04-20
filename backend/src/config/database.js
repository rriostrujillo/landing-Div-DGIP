require('dotenv').config();
const { Sequelize } = require('sequelize');

const path = require('path');

// Use SQLite for local development, MariaDB for production
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = isProduction
  ? new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        dialect: 'mariadb',
        logging: false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        define: { timestamps: true, underscored: true }
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', '..', 'database.sqlite'),
      logging: false,
      define: { timestamps: true, underscored: true }
    });

module.exports = sequelize;
