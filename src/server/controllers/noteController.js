import { pool } from "../config/database.js";

export const getNotes = async (req, res) => {
  try {
    const [notes] = await pool.query(
      `
      SELECT 
        Note.id, 
        Note.title, 
        Note.content, 
        Note.createdAt, 
        Note.status, 
        User.username 
      FROM Note
      JOIN User ON Note.userId = User.id
      WHERE Note.status = ?`,
      ["public"]
    );

    res.json({ notes });
  } catch (error) {
    console.error("Error during note retrieval:", error);
    res.status(500).json({ msg: "Server error during note retrieval" });
  }
};

export const userNotes = async (req, res) => {
  try {
    const { userid } = req.params;

    const [notes] = await pool.query("SELECT * FROM Note WHERE id = ?", [
      userid,
    ]);

    res.json({ notes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during note retrieval" });
  }
};

export const getNote = async (req, res) => {
  try {
    const [notes] = await pool.query(
      "SELECT id, title,content,createdAt,status FROM Note WHERE id = ? and status = ?",
      [req.params.noteid, "public"]
    );
    const note = notes[0];
    if (!note) {
      return res.status(404).json({ msg: "Note not found" });
    }
    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during note retrieval" });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, content, status, shareId } = req.body;
    const userId = req.user.id;

    await pool.query(
      "INSERT INTO Note (title, content, userId,status,shareId) VALUES (?, ?, ?,?,?)",
      [title, content, userId, status, shareId]
    );

    res.status(201).json({ msg: "Note created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during note creation" });
  }
};
export const editNote = async (req, res) => {
  try {
    const { title, content, status } = req.body;
    const { noteid } = req.params;

    const [result] = await pool.query(
      "UPDATE Note SET title = ?, content = ?, updatedAt = NOW() , status = ? WHERE id = ? AND userId = ?",
      [title, content, status, noteid, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Note not found or unauthorized" });
    }

    res.json({ msg: "Note updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during note update" });
  }
};
export const deleteNote = async (req, res) => {
  try {
    const { noteid } = req.params;

    const [result] = await pool.query(
      "DELETE FROM Note WHERE id = ? AND userId = ?",
      [noteid, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Note not found or unauthorized" });
    }

    res.json({ msg: "Note deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during note deletion" });
  }
};

export const searchData = async (req, res) => {
  console.log("dsdsd");

  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ msg: "Query is required" });
    }

    // Search for notes where the title or shareId contains the query (case-insensitive)
    const [notes] = await pool.query(
      "SELECT id, title,content,createdAt,status FROM Note WHERE shareId = ?",
      [query]
    );

    // If no notes found
    if (notes.length === 0) {
      return res.status(404).json({ msg: "No notes found" });
    }

    res.json({ notes }); // Return the found notes
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during search" });
  }
};
