import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

// Helper function to create and send JWT
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    profilePicUrl: user.profilePicUrl,
    email: user.email,
    bio: user.bio,
    joinedDate: user.createdAt,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
};

// Register a new user
export const register = async (req, res) => {
  const { username, email, password, bio } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ msg: "Please provide all required fields" });
  }

  try {
    const [existingUser] = await pool.query(
      "SELECT * FROM User WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ msg: "Email is already registered", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO User (username, email, password, bio) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, bio]
    );

    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during registration" });
  }
};

// Login user and return JWT token
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please provide email and password" });
  }

  try {
    const [users] = await pool.query("SELECT * FROM User WHERE email = ?", [
      email,
    ]);
    const user = users[0];
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicUrl: user.profilePicUrl,
        joinedDate: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during login" });
  }
};

// Logout user
export const logout = (req, res) => {
  res.json({ msg: "Logout successful" });
};

// Get the authenticated user from the token
export const getUser = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, email, bio, profilePicUrl FROM User WHERE id = ?",
      [req.user.id]
    );
    const user = users[0];

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during user retrieval" });
  }
};

// Route to validate token
export const validate = async (req, res) => {
  const [user] = await pool.query("SELECT * FROM User WHERE id = ? ", [
    req.user.id,
  ]);

  if (user.length === 0) {
    return res.status(401).json({ isValid: false });
  }
  res.json({ isValid: true });
};
