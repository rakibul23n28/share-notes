import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import { getAuthHeaders, timeAgo } from "../utils/Helper";
import Layout from "../components/Layout";

const NoteDetails = () => {
  const { shareId } = useParams(); // Get the dynamic shareId from the URL
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`/api/notes/${shareId}`, {
          headers: getAuthHeaders(),
        });
        setNote(response.data.note);
      } catch (err) {
        setError("Failed to load the note details.");
        console.error("Error fetching note:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [shareId]);

  // Navigate to profile page
  const handleUsernameClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
        {note ? (
          <>
            {/* Author and Timestamp */}
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center space-x-4 cursor-pointer"
                onClick={() => handleUsernameClick(note.userId)} // Handle username click
              >
                <div className="rounded-full bg-blue-100 h-10 w-10 flex items-center justify-center text-blue-500 font-bold text-lg">
                  <img
                    src={note.profilePicUrl || "/uploads/defuser.png"} // Use default image if profilePicUrl does not exist
                    alt={note.username}
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {note.username}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Created: {timeAgo(note.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {note.title}
            </h1>

            {/* Content */}
            <div dangerouslySetInnerHTML={{ __html: note.content }}></div>
          </>
        ) : (
          <p className="text-gray-500 text-center">No note found.</p>
        )}
      </div>
    </Layout>
  );
};

export default NoteDetails;
