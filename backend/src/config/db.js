const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test DB connection on startup
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database pool');
    connection.release();
  } catch (error) {
    console.error('Error connecting to MySQL database pool:', error.message);
  }
}

testDbConnection();

module.exports = pool;
