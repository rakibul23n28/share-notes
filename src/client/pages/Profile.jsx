import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook
import Layout from "../components/Layout";
import axios from "axios";
import { Link } from "react-router-dom";

import { getAuthHeaders, timeAgo } from "../utils/Helper.js";

const Profile = () => {
  const { user, setUser } = useAuth(); // Use user and setUser from context
  const [notes, setNotes] = useState([]);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    profilePicUrl: user?.profilePicUrl || "",
  });
  const [preview, setPreview] = useState(user?.profilePicUrl);
  const [usernameError, setUsernameError] = useState(null);

  // Fetch notes when the user is available
  useEffect(() => {
    if (user && notes.length === 0) {
      const fetchNotes = async () => {
        try {
          const response = await axios.get(`/api/notes/all/${user.id}`, {
            headers: getAuthHeaders(),
          });

          setNotes(response.data.notes);
          console.log(response.data.notes);
        } catch (err) {
          console.error("Failed to fetch notes:", err);
        }
      };
      fetchNotes();
    }
  }, [user, notes]);

  // Check username availability
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!editData.username) {
        setUsernameError(null);
        return;
      }
      if (editData.username === user.username) {
        setUsernameError(null);
        return;
      }
      try {
        const response = await axios.get(
          `/api/user/exists/${editData.username}`
        );
        if (response.data.exists) {
          setUsernameError("Username is already taken");
        } else {
          setUsernameError(null);
        }
      } catch (err) {
        console.error("Failed to check username:", err);
      }
    };

    const debounceTimeout = setTimeout(() => {
      checkUsernameAvailability();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(debounceTimeout); // Clean up the timeout if the user types again
  }, [editData.username]);

  // Handle input change for the profile update
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleProfileUpdate = async () => {
    if (usernameError) {
      alert("Please resolve username issues before saving.");
      return;
    }

    try {
      let formData = new FormData();

      // Append username and bio to the form data
      formData.append("username", editData.username);
      formData.append("bio", editData.bio);

      if (editData.profilePicUrl) {
        // Validate if the profilePicUrl contains a base64 string
        const parts = editData.profilePicUrl.split(",");
        if (parts.length === 2) {
          const base64Data = parts[1]; // Extract the base64 part
          const byteCharacters = atob(base64Data); // Decode base64 string
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
          }
          const blob = new Blob(byteArrays, { type: "image/jpeg" });
          const file = new File([blob], "profile-pic.jpg", {
            type: "image/jpeg",
          });

          // Append the profile picture file to the form data
          formData.append("profilePic", file);
        } else {
          console.warn("Invalid profilePicUrl format.");
        }
      }

      const response = await axios.put("/api/user/update", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle response and update user state
      const userWithToken = {
        ...response.data.user,
        token: response.data.token,
      };
      setUser(userWithToken);
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setIsEditing(false);

      return { success: true };
    } catch (err) {
      console.error("Failed to update profile:", err);
      return {
        success: false,
        message:
          err.response?.data?.msg || "Profile update failed. Please try again.",
      };
    }
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result;
        setPreview(base64String);
        setEditData({ ...editData, profilePicUrl: base64String });
      };

      reader.readAsDataURL(file); // Read the file as Data URL
    }
  };
  // Handle note delete
  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      const response = await axios.delete(`/api/notes/${noteId}`, {
        headers: getAuthHeaders(),
      });

      // Filter out the deleted note from the state
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  // Toggle the expansion of the notes
  const toggleNoteExpansion = (noteId) => {
    setExpandedNoteId((prevId) => (prevId === noteId ? null : noteId));
  };

  // Check if user is logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }
  // Copy shearid to clipboard
  const copyToClipboard = (shearid) => {
    navigator.clipboard
      .writeText(shearid)
      .then(() => {
        alert("ShearID copied to clipboard!");
      })
      .catch((err) => {
        alert("Failed to copy ShearID!");
      });
  };

  return (
    <Layout>
      <div className="flex justify-center">
        <div className="w-full p-6  relative ">
          <div className="space-y-6 flex w-full items-center justify-center">
            {/* Profile Picture and Bio Section */}
            <div>
              <div className="flex flex-col items-center justify-center space-x-6">
                <div className="">
                  {user.profilePicUrl ? (
                    <img
                      src={user.profilePicUrl}
                      alt={`${user.username}'s profile`}
                      className="w-24 h-24 rounded-full object-cover border"
                    />
                  ) : (
                    <i className="fas fa-user-circle text-6xl text-gray-500 "></i>
                  )}
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
                <div className="mt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    <i className="fas fa-pen mr-2"></i>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-bold mt-6 mb-4 text-center text-yellow-400">
            Your Notes
          </h2>
          <div className="flex flex-col items-center">
            {notes ? (
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
                    {/* Display Shear ID with Copy button */}
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">
                        Shear ID: {note.shareId}
                      </span>
                      <span className="text-blue-500">{note.shearId}</span>
                      <button
                        onClick={() => copyToClipboard(note.shareId)}
                        className="text-blue-500 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="notebar flex items-center justify-between rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.username}</h3>
                        <h6 className="text-gray-600 text-[10px]">
                          {timeAgo(note.createdAt)}
                        </h6>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Link to={`/edit/${note.id}`}>
                          <h3 className="hover:underline cursor-pointer text-green-500">
                            Edit
                          </h3>
                        </Link>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="hover:underline cursor-pointer text-red-500"
                        >
                          Delete
                        </button>
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

          {/* Edit Profile Popup */}
          {isEditing && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 top-0 left-[50%] translate-x-[-50%] w-full">
              <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={preview || user.profilePicUrl}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold">Username:</label>
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg"
                    />
                    {usernameError && (
                      <p className="text-red-500">{usernameError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold">Bio:</label>
                    <textarea
                      name="bio"
                      value={editData.bio}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg"
                    ></textarea>
                  </div>

                  <div className="mt-4">
                    <label className="block font-semibold">Email:</label>
                    <p className="w-full p-2 border bg-gray-100 rounded-lg">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={handleProfileUpdate}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setPreview(user?.profilePicUrl);
                      setEditData((prevData) => ({
                        ...prevData,
                        profilePicUrl: user?.profilePicUrl,
                      }));
                    }}
                    className="px-4 py-2 bg-gray-300 text-black rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
