module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "postgres",
  PASSWORD: process.env.DB_PASSWORD || "Joker0328",
  DB: process.env.DB_NAME || "localexpress",
  dialect: process.env.DB_DIALECT || "postgres",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
