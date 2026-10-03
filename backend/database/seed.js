const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Pallavi@2006',
    database: process.env.DB_NAME || 'store_rating_db',
    multipleStatements: true
  });

  console.log('Seeding database...');

  try {
    // Hash passwords (all passwords meet requirement: 8-16 chars, 1 uppercase, 1 special char)
    const adminPasswordHash = await bcrypt.hash('AdminPass@123', 10);
    const ownerPasswordHash = await bcrypt.hash('OwnerPass@123', 10);
    const user1PasswordHash = await bcrypt.hash('UserPass@1234', 10);
    const user2PasswordHash = await bcrypt.hash('UserPass@5678', 10);

    // Clear existing data
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE ratings');
    await connection.query('TRUNCATE TABLE stores');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // Insert Users (Name length: 20 to 60 chars)
    const [usersResult] = await connection.query(`
      INSERT INTO users (name, email, password, address, role) VALUES
      ('System Administrator Account', 'admin@roxiler.com', ?, '123 Admin Street, Tech Headquarters, CA 90001', 'SYSTEM_ADMIN'),
      ('Store Owner Manager User', 'owner@roxiler.com', ?, '456 Commerce Avenue, Business District, NY 10001', 'STORE_OWNER'),
      ('Johnathan Doe Sample User', 'user1@roxiler.com', ?, '789 Residential Way, Apartment 4B, TX 75001', 'NORMAL_USER'),
      ('Alice Smith Reviewer One', 'user2@roxiler.com', ?, '321 Boulevard Park, Suite 100, FL 33101', 'NORMAL_USER')
    `, [adminPasswordHash, ownerPasswordHash, user1PasswordHash, user2PasswordHash]);

    console.log('Users seeded successfully.');

    // Get user IDs
    const [users] = await connection.query('SELECT id, role, email FROM users');
    const owner = users.find(u => u.role === 'STORE_OWNER');
    const user1 = users.find(u => u.email === 'user1@roxiler.com');
    const user2 = users.find(u => u.email === 'user2@roxiler.com');

    // Insert Stores
    const [storesResult] = await connection.query(`
      INSERT INTO stores (name, email, address, owner_id) VALUES
      ('Roxiler Electronics Store Super', 'store1@roxiler.com', '101 Innovation Drive, Silicon Valley, CA 94025', ?),
      ('Roxiler Daily Fresh Grocery Market', 'store2@roxiler.com', '202 Market Square, Downtown, NY 10002', NULL)
    `, [owner.id]);

    console.log('Stores seeded successfully.');

    const [stores] = await connection.query('SELECT id FROM stores ORDER BY id ASC');
    const store1Id = stores[0].id;
    const store2Id = stores[1].id;

    // Insert Ratings
    await connection.query(`
      INSERT INTO ratings (user_id, store_id, rating) VALUES
      (?, ?, 5),
      (?, ?, 4),
      (?, ?, 3)
    `, [user1.id, store1Id, user2.id, store1Id, user1.id, store2Id]);

    console.log('Ratings seeded successfully.');
    console.log('Database seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await connection.end();
  }
}

seed();
