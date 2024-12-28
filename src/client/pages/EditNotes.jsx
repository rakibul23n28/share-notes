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
  const [status, setStatus] = useState("public");
  const navigate = useNavigate();

  // Fetch the existing note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`/api/notes/edit/${noteid}`, {
          headers: getAuthHeaders(),
        });
        const { title, content, status } = response.data.note;
        setTitle(title);
        setContent(content);
        setStatus(status);
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
        <h1 className="text-4xl font-extrabold text-blue-600 mb-8">
          Edit Note
        </h1>
        <form
          onSubmit={handleEdit}
          className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl border"
        >
          {/* Title Input */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-lg font-semibold mb-2 text-gray-700"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-lg font-semibold mb-2 text-gray-700"
            >
              Content
            </label>
            <div className="h-96 bg-gray-50 rounded-lg overflow-hidden shadow-inner">
              <QuillEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* Status Radio Buttons */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2 text-gray-700">
              Status
            </label>
            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="public"
                  name="status"
                  value="public"
                  checked={status === "public"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mr-2 focus:ring-blue-500"
                />
                <label htmlFor="public" className="text-gray-700">
                  Public
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="protected"
                  name="status"
                  value="protected"
                  checked={status === "protected"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mr-2 focus:ring-blue-500"
                />
                <label htmlFor="protected" className="text-gray-700">
                  Protected
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-300"
            >
              Update Note
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditNotes;
