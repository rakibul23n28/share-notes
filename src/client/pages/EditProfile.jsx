import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const [editData, setEditData] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    profilePicUrl: user?.profilePicUrl || "",
  });
  const [preview, setPreview] = useState(user?.profilePicUrl);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await axios.put(`/api/user/${user.id}`, editData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setUser(response.data.user);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handlePasswordChange = async () => {
    try {
      await axios.put(`/api/user/${user.id}/change-password`, passwordData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      alert("Password updated successfully");
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error("Failed to change password:", err);
    }
  };

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

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={preview}
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

          {isChangingPassword ? (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block font-semibold">Current Password:</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChangeInput}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold">New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChangeInput}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Update Password
              </button>
            </div>
          ) : (
            <button
              className="text-blue-500 underline mt-4"
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </button>
          )}
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleProfileUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Save
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-300 text-black rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
