const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSetup() {
  console.log('Setting up MySQL database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Pallavi@2006',
    multipleStatements: true
  });

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('Schema executed successfully.');
    await connection.end();

    // Now run seed script
    require('./seed.js');
  } catch (err) {
    console.error('Database setup failed:', err.message);
    await connection.end();
  }
}

runSetup();
