import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import QuillEditor from "../components/QuillEditor";
import axios from "axios";

import { getAuthHeaders } from "../utils/Helper.js";

// Function to generate a random shareId (alphanumeric string)
const generateShareId = () => {
  return Math.random().toString(36).substr(2, 11); // Generates a random string of length 9
};

const Create = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shareId, setShareId] = useState(""); // State for share ID
  const [status, setStatus] = useState("public"); // State for note status (public/protected)
  const navigate = useNavigate();

  // Set a random shareId when the component mounts
  useEffect(() => {
    setShareId(generateShareId());
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!title || !content || !shareId) {
      // Check if share ID, title, and content are provided
      alert("Title, content, and share ID are required!");
      return;
    }

    const noteData = {
      title,
      content,
      shareId, // Include share ID in the data
      status, // Include status in the data
    };

    try {
      const response = await axios.post("/api/notes", noteData, {
        headers: getAuthHeaders(),
      });
      console.log(response.data);
      alert("Note created successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to create the note.");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Create Note</h1>
        <form
          onSubmit={handleCreate}
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
          {/* Input field for Share ID */}
          <div className="mb-8">
            <label htmlFor="shareId" className="block font-semibold mb-1">
              Share ID
            </label>
            <input
              id="shareId"
              type="text"
              value={shareId}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-100"
            />
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
              Create
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Create;
