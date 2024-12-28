import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import QuillEditor from "../components/QuillEditor";
import axios from "axios";
import { getAuthHeaders } from "../utils/Helper.js";

// Function to generate a random shareId (alphanumeric string)
const generateShareId = () => {
  return Math.random().toString(36).substr(2, 11);
};

const Create = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shareId, setShareId] = useState("");
  const [status, setStatus] = useState("public");
  const navigate = useNavigate();

  useEffect(() => {
    setShareId(generateShareId());
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !content || !shareId) {
      alert("Title, content, and share ID are required!");
      return;
    }

    const noteData = { title, content, shareId, status };

    try {
      const response = await axios.post("/api/notes", noteData, {
        headers: getAuthHeaders(),
      });
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
        <h1 className="text-4xl font-extrabold mb-8 text-blue-600">
          Create Note
        </h1>
        <form
          onSubmit={handleCreate}
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

          {/* Share ID (Read-Only) */}
          <div className="mb-6">
            <label
              htmlFor="shareId"
              className="block text-lg font-semibold mb-2 text-gray-700"
            >
              Share ID
            </label>
            <input
              id="shareId"
              type="text"
              value={shareId}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:outline-none"
            />
          </div>

          {/* Note Status */}
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
              Create Note
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Create;
