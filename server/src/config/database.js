const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const hasPostgresConfig = Boolean(process.env.DATABASE_URL || process.env.DB_NAME);

let sequelize;

if (hasPostgresConfig) {
  sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: process.env.DB_SSL === 'true'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      })
    : new Sequelize(
        process.env.DB_NAME || 'codecollab',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || '',
        {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          dialect: 'postgres',
          logging: process.env.NODE_ENV === 'development' ? console.log : false,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        }
      );
} else {
  const storageDir = path.join(__dirname, '..', '..', 'data');
  fs.mkdirSync(storageDir, { recursive: true });
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(storageDir, 'codecollab.sqlite'),
    logging: false,
  });
}

module.exports = sequelize;
