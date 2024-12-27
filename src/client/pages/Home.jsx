import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { timeAgo } from "../utils/Helper";

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  // Fetch notes from the backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get("/api/notes/data", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming JWT is stored in localStorage
          },
        });
        setNotes(response.data.notes);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Toggle note expansion
  const toggleNoteExpansion = (noteId) => {
    setExpandedNoteId((prevId) => (prevId === noteId ? null : noteId));
  };

  return (
    <Layout>
      <div className="px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Public Notes</h1>
        <div className="flex flex-col items-center">
          {loading ? (
            <p className="text-center">Loading notes...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className={`border p-4 rounded-lg overflow-hidden transition-all duration-300 w-auto m-4 ${
                  expandedNoteId === note.id ? "h-auto" : "h-52"
                }`}
                onDoubleClick={() => toggleNoteExpansion(note.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="flex flex-col mb-6">
                  <div className="notebar flex items-center justify-between rounded-lg">
                    <div>
                      <h3 className="font-semibold">{note.username}</h3>
                      <h6 className="text-gray-600 text-[10px]">
                        {timeAgo(note.createdAt)}
                      </h6>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="font-medium mb-3">{note.title}</h3>
                  <div
                    className={`note-content transition-all duration-300 ${
                      expandedNoteId === note.id
                        ? "line-clamp-none"
                        : "line-clamp-5"
                    }`}
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No notes found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
