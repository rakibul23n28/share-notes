import { useState, useEffect } from "react";
import Layout from "../components/Layout.jsx";
import axios from "axios";
import { useParams } from "react-router-dom";

import { getAuthHeaders, timeAgo } from "../utils/Helper.js";

const ViewProfile = () => {
  const { id } = useParams(); // Get the user ID from URL params
  const [user, setUser] = useState(null); // User profile data
  const [notes, setNotes] = useState([]); // Notes of the user
  const [expandedNoteId, setExpandedNoteId] = useState(null); // To toggle note content expansion

  // Fetch user profile dataa
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`/api/user/${id}`, {
          headers: getAuthHeaders(),
        });
        setUser(response.data.user);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        alert("User does not exist or cannot be fetched.");
      }
    };

    fetchUserProfile();
  }, [id]);

  // Fetch notes when the user is available
  useEffect(() => {
    if (user) {
      const fetchNotes = async () => {
        try {
          const response = await axios.get(`/api/notes/all/public/${user.id}`, {
            headers: getAuthHeaders(),
          });
          setNotes(response.data.notes);
        } catch (err) {
          console.error("Failed to fetch notes:", err);
        }
      };
      fetchNotes();
    }
  }, [user]);

  // Copy Share ID to Clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Share ID copied to clipboard!");
    });
  };

  // Toggle the expansion of the notes
  const toggleNoteExpansion = (noteId) => {
    setExpandedNoteId((prevId) => (prevId === noteId ? null : noteId));
  };

  // Render if user data is not available
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">User does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex justify-center mt-8">
        <div className="w-full p-6 relative">
          <div className="space-y-6 flex w-full items-center justify-center">
            {/* Profile Picture and Bio Section */}
            <div>
              <div className="flex flex-col items-center justify-center space-x-6">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-blue-100 h-36 w-36 flex items-center justify-center text-blue-500 font-bold text-lg">
                    <img
                      src={user.profilePicUrl || "/uploads/defuser.png"} // Use default image if profilePicUrl does not exist
                      alt={user.username}
                      className="rounded-full w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                </div>
                <div>
                  {user.bio && <p className="text-gray-600">{user.bio}</p>}
                </div>
              </div>
              <div className="space-y-4 mt-6 flex flex-col items-center">
                <div>
                  <span className="font-semibold">Email:</span> {user.email}
                </div>
                {user.joinedDate && (
                  <div>
                    <span className="font-semibold">Joined:</span>{" "}
                    {new Date(user.joinedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <h2 className="text-4xl font-bold mt-6 mb-4 text-center text-yellow-400">
            {notes.length} Notes
          </h2>
          <div className="flex flex-col items-center">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`border p-4 rounded-lg shadow-md transition-all duration-300 w-full max-w-lg  my-8 ${
                    expandedNoteId === note.id ? "h-auto" : "h-52"
                  }`}
                  onDoubleClick={() => toggleNoteExpansion(note.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex flex-col mb-6">
                    {/* Display Share ID with Copy button */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span>Share ID:</span>{" "}
                        <span className="text-blue-500">{note.shareId}</span>
                      </div>
                      <span
                        className={`status-label ${
                          note.status === "public"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }`}
                      >
                        {note.status.charAt(0).toUpperCase() +
                          note.status.slice(1)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(note.shareId)}
                        className="text-blue-500 text-sm hover:underline"
                      >
                        Copy
                      </button>
                    </div>

                    {/* Note meta information */}
                    <div className="flex items-center justify-between mt-2 overflow-hidden">
                      <div className="w-full pr-4">
                        <h3 className="font-semibold text-lg truncate">
                          {note.title}
                        </h3>
                        <p className="text-gray-500 text-xs">
                          {timeAgo(note.createdAt)} by{" "}
                          {note.username || user.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Note content */}
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div
                      className={`note-content text-sm text-gray-800 transition-all duration-300 ${
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
              <p className="text-center text-gray-600 mt-4">No notes found.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewProfile;
