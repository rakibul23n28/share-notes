import { pool } from "../config/database.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get current directory path (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export const existUsername = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT username FROM User WHERE username = ?",
      [req.params.username]
    );

    if (users.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during user retrieval" });
  }
};

export const updateUser = async (req, res) => {
  const { username, bio } = req.body;
  const userId = req.user?.id;
  let profilePicUrl = req.user.profilePicUrl;

  if (req.file) {
    profilePicUrl = `/uploads/${req.file.filename}`;
    // Delete the old profile picture if it exists
    if (req.user.profilePicUrl) {
      const oldPicPath = path.join(
        __dirname,

        "../../../",
        req.user.profilePicUrl
      );
      console.log(oldPicPath);

      fs.unlink(oldPicPath, (err) => {
        if (err) {
          console.error("Failed to delete old profile picture:", err);
        }
      });
    }
  }

  if (!username) {
    return res.status(400).json({ msg: "Please provide a username" });
  }

  try {
    // Update the user in the database
    const result = await pool.query(
      "UPDATE User SET username = ?, bio = ?, profilePicUrl = ? WHERE id = ?",
      [username, bio, profilePicUrl, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ msg: "Failed to update user" });
    }

    // Fetch the updated user data
    const [users] = await pool.query("SELECT * FROM User WHERE id = ?", [
      userId,
    ]);
    const user = users[0];

    // Generate a new JWT token with the updated user data
    const token = generateToken(user);

    res.json({
      msg: "Profile updated successfully",
      token, // Return the new token
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
    res.status(500).json({ msg: "Server error during profile update" });
  }
};
