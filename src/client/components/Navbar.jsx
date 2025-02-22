import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthHeaders, timeAgo } from "../utils/Helper";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(true);
  const [searchView, setSearchView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  // Handle search query input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Search for notes based on the query
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`/api/notes/search`, {
        params: { query: searchQuery },
        headers: getAuthHeaders(),
      });
      setSearchResults(response.data.notes);
    } catch (error) {
      console.error("Error searching notes:", error);
    }
  };

  // Redirect to note details using shareId
  const handleResultClick = (shareId) => {
    navigate(`/note/${shareId}`);
  };

  return (
    <div
      className={`pt-3 pb-0 ${
        menuOpen ? "h-screen" : ""
      } w-[60px] bg-pink-50 flex flex-col items-center justify-between border-b px-3 z-50`}
    >
      {/* Toggle Menu Button */}
      <button
        className={`text-gray-700 hover:text-red-400`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <i className="fas fa-bars text-2xl"></i>
      </button>

      {/* Search View */}
      {searchView && (
        <div className="absolute top-0 left-0 w-screen mt-1 -z-30">
          <div className="shadow-md border flex flex-row ml-16 mr-6 justify-center rounded-lg bg-white gap-2">
            <div className="flex w-full">
              <input
                type="text"
                placeholder="Enter share ID to search ..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full py-1 px-4 focus:outline-none rounded-lg"
              />
              <button
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-4"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
            {/* Cross Icon */}
            <button
              className="text-gray-700 hover:text-red-500 mr-2"
              onClick={() => setSearchView(false)}
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>

          {/* Display search results */}
          {searchResults.length > 0 && (
            <div className="absolute top-16 left-16 w-96 bg-white shadow-lg p-4 rounded-lg">
              <h3 className="font-semibold">Search Results</h3>
              <ul className="space-y-2 mt-2">
                {searchResults.map((note) => (
                  <div
                    key={note.shareId}
                    onClick={() => handleResultClick(note.shareId)}
                    className="cursor-pointer hover:shadow-md transition-shadow duration-300 bg-white border rounded-lg p-4 mb-2 flex flex-col items-start space-y-2"
                  >
                    {/* Header Section */}
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800">
                          {note.username}
                        </h3>
                        <h6 className="text-gray-600 text-sm">
                          {timeAgo(note.createdAt)}
                        </h6>
                      </div>
                    </div>

                    {/* Note Title */}
                    <div className="w-full">
                      <h4 className="font-medium text-gray-700 hover:text-red-500">
                        {note.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Navbar Buttons */}
      {menuOpen && (
        <div className="flex flex-col space-y-6 w-full items-center">
          <button
            className="flex flex-col items-center text-gray-700 hover:text-red-500"
            onClick={() => setSearchView(!searchView)}
          >
            <i className="fas fa-search text-2xl"></i>
            <span className="text-sm">Search</span>
          </button>
          <Link to="/">
            <button className="flex flex-col items-center text-gray-700 hover:text-red-500">
              <i className="fas fa-home text-2xl mb-1"></i>
              <span className="text-sm">Home</span>
            </button>
          </Link>
          {user && (
            <>
              <Link to="/profile">
                <button className="flex flex-col items-center text-gray-700 hover:text-red-500">
                  <i className="fas fa-user text-2xl mb-1"></i>
                  <span className="text-sm">Profile</span>
                </button>
              </Link>
              <Link to="/create">
                <button className="flex flex-col items-center text-gray-700 hover:text-red-500">
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                    <i className="fas fa-add text-2xl"></i>
                  </div>
                  <span className="text-sm mt-1">Create</span>
                </button>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Login/Logout Section */}
      <div className="mb-3">
        {menuOpen &&
          (user ? (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to logout?")) {
                  logout();
                }
              }}
              className="flex flex-col items-center text-red-500 hover:text-red-700"
            >
              <i className="fas fa-sign-out-alt text-2xl mb-1"></i>
              <span className="text-sm">Logout</span>
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Link to="/login">
                <button className="flex flex-col items-center text-green-500 hover:text-green-700">
                  <i className="fas fa-sign-in-alt text-2xl mb-1"></i>
                  <span className="text-sm">Login</span>
                </button>
              </Link>
              <Link to="/register">
                <button className="flex flex-col items-center text-blue-500 hover:text-blue-700">
                  <i className="fas fa-user-plus text-2xl mb-1"></i>
                  <span className="text-sm">Register</span>
                </button>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Navbar;
