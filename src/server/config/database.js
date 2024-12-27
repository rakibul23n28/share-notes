import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// Initialize the MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "testdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to create tables
const createTables = async () => {
  try {
    const connection = await pool.getConnection();

    // Create User Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS User (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        bio TEXT,
        profilePicUrl VARCHAR(512) DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Create Note Table with status column
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Note (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        shareId VARCHAR(50),
        status ENUM('public', 'protected') DEFAULT 'public',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log("Tables created successfully.");
    connection.release();
  } catch (error) {
    console.error("Error creating tables:", error.message);
    throw error;
  }
};

// Function to seed the database
const seedDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    // Check if the User table already has data
    const [userRows] = await connection.query(
      `SELECT COUNT(*) AS count FROM User`
    );
    const userCount = userRows[0].count;

    if (userCount === 0) {
      console.log("Seeding Users...");
      const users = [];
      for (let i = 1; i <= 20; i++) {
        const password = await bcrypt.hash(`password${i}`, 10);
        const username = `user${i}`;
        const email = `user${i}@example.com`;
        const bio = `This is a bio for ${username} and password is password${i}`;
        users.push([username, email, password, bio]);
      }
      await connection.query(
        `INSERT INTO User (username, email, password, bio) VALUES ?`,
        [users]
      );
      console.log("Users seeded successfully.");
    } else {
      console.log("Users already exist. Skipping User seeding.");
    }

    // Check if the Note table already has data
    const [noteRows] = await connection.query(
      `SELECT COUNT(*) AS count FROM Note`
    );
    const noteCount = noteRows[0].count;

    if (noteCount === 0) {
      console.log("Seeding Notes...");
      const [userIds] = await connection.query(`SELECT id FROM User`);
      const notes = [];
      userIds.forEach((user, index) => {
        const title = `Note ${index + 1}`;
        const content = `This is the content of note ${index + 1} for user ID ${
          user.id
        }.`;
        const status = index % 2 === 0 ? "public" : "protected";
        const shareId = Math.random().toString(36).substr(2, 11);

        notes.push([user.id, title, content, status, shareId]);
      });
      await connection.query(
        `INSERT INTO Note (userId, title, content, status,shareId) VALUES ?`,
        [notes]
      );
      console.log("Notes seeded successfully.");
    } else {
      console.log("Notes already exist. Skipping Note seeding.");
    }

    connection.release();
  } catch (error) {
    console.error("Error seeding database:", error.message);
    throw error;
  }
};

// Execute table creation and database seeding
const initializeDatabase = async () => {
  await createTables();
  await seedDatabase();
};

initializeDatabase();

export { pool };
