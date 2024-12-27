import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import QuillEditor from "../components/QuillEditor";
import axios from "axios";

import { getAuthHeaders } from "../utils/Helper.js";

const EditNotes = () => {
  const { noteid } = useParams(); // Get the note ID from URL params
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("public"); // Add status if needed
  const navigate = useNavigate();

  // Fetch the existing note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`/api/notes/${noteid}`, {
          headers: getAuthHeaders(),
        });
        const { title, content, status } = response.data.note; // Fetch status as well if needed
        setTitle(title);
        setContent(content);
        setStatus(status); // Set the current status
      } catch (err) {
        console.error(err);
        alert("Failed to fetch the note.");
      }
    };

    fetchNote();
  }, [noteid]);

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("Both title and content are required!");
      return;
    }

    const updatedNoteData = {
      title,
      content,
      status,
    };

    try {
      const response = await axios.put(
        `/api/notes/${noteid}`,
        updatedNoteData,
        {
          headers: getAuthHeaders(),
        }
      );
      console.log(response.data);
      alert("Note updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Failed to update the note.");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Note</h1>
        <form
          onSubmit={handleEdit}
          className="flex flex-col gap-8 w-full max-w-4xl"
        >
          <div className="mb-8">
            <label htmlFor="title" className="block font-semibold mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="mb-8">
            <label htmlFor="content" className="block font-semibold mb-2">
              Content
            </label>
            <div className="h-96">
              <QuillEditor value={content} onChange={setContent} />
            </div>
          </div>
          {/* Radio Buttons for Note Status */}
          <div className="mb-8">
            <label className="block font-semibold mb-2">Status</label>
            <div className="flex items-center gap-6">
              <div>
                <input
                  type="radio"
                  id="public"
                  name="status"
                  value="public"
                  checked={status === "public"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mr-2"
                />
                <label htmlFor="public">Public</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="protected"
                  name="status"
                  value="protected"
                  checked={status === "protected"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mr-2"
                />
                <label htmlFor="protected">Protected</label>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditNotes;
