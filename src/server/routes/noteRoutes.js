import express from "express";
import {
  getNotes,
  getNote,
  createNote,
  userNotes,
  editNote,
  deleteNote,
  searchData,
} from "../controllers/noteController.js";
import { validateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/search", searchData);
router.get("/data", getNotes); // Fetch all notes
router.get("/:noteid", validateToken, getNote); // Fetch a specific note
router.get("/all/:userid", validateToken, userNotes); // Fetch all notes of a user
router.post("/", validateToken, createNote); // Create a new note
router.put("/:noteid", validateToken, editNote); // Edit a note
router.delete("/:noteid", validateToken, deleteNote); // Delete a note

export default router;
