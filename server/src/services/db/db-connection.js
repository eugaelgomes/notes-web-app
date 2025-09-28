const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DATABASE_HOST_URL,
  port: parseInt(process.env.DATABASE_SERVICE_PORT, 10),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    rejectUnauthorized: false,
    //ca: process.env.SSL_CERTIFICATE,
  },
});

async function getConnection() {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error("Pool connection failed:", error.message);
    throw error;
  }
}

async function executeQuery(sql, params = []) {
  const client = await getConnection();
  try {
    const { rows } = await client.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, getConnection, executeQuery };
