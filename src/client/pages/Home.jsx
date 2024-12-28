import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Layout from "../components/Layout";
import { timeAgo } from "../utils/Helper";

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

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

  // Navigate to note page
  const handleReadMore = (shareId) => {
    navigate(`/note/${shareId}`);
  };

  // Navigate to profile page
  const handleUsernameClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <Layout>
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Public Notes</h1>
        {loading ? (
          <p className="text-center">Loading notes...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-6 bg-white shadow-md rounded-lg transition-all duration-300 cursor-pointer hover:shadow-lg"
              >
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {/* Profile Image */}
                    <div className="rounded-full bg-blue-100 h-10 w-10 flex items-center justify-center text-blue-500 font-bold text-lg">
                      <img
                        src={note.profilePicUrl || "/uploads/defuser.png"} // Use default image if profilePicUrl does not exist
                        alt={note.username}
                        className="rounded-full w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-gray-800 cursor-pointer"
                        onClick={() => handleUsernameClick(note.userId)}
                      >
                        {note.username}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {timeAgo(note.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {note.title}
                </h3>

                {/* Content */}
                <div
                  className="text-gray-700 leading-relaxed line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                ></div>

                {/* Read More Button */}
                <p
                  className="text-blue-500 mt-3 cursor-pointer text-sm"
                  onClick={() => handleReadMore(note.shareId)}
                >
                  Read more
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No notes found.</p>
        )}
      </div>
    </Layout>
  );
};

export default Home;
