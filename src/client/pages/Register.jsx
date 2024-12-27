import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { validatePassword } from "../utils/Helper.js";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null); // For password error
  const navigate = useNavigate();

  // Check if username is available
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!username) {
        setUsernameError(null);
        return;
      }

      try {
        const response = await axios.get(`/api/user/exists/${username}`);
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
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password
    const passwordValidationMessage = validatePassword(password);
    if (passwordValidationMessage) {
      setPasswordError(passwordValidationMessage);
      return;
    }

    // If username is invalid or password is weak, stop the form submission
    if (usernameError || passwordError) {
      setMessage("Please resolve the issues before submitting.");
      return;
    }

    try {
      const { data } = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });
      if (data.success) {
        setMessage(data.msg);
        setUsername("");
        setEmail("");
        setPassword("");
        return;
      }
      navigate("/login");
    } catch (error) {
      console.error("Error during signup", error);
    }
  };

  return (
    <Layout>
      <div className="flex h-screen w-full">
        <div className="w-1/2 bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <form onSubmit={handleSubmit}>
              {message && <p className="text-red-500 mb-4">{message}</p>}
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {usernameError && (
                  <p className="text-red-500 mt-2">{usernameError}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="text-red-500 mt-2">{passwordError}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Register
                </button>
              </div>
            </form>
            <div className="text-center mt-4">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="underline hover:text-green-500">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="w-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white flex flex-col justify-center items-center p-10">
          <img
            src="https://via.placeholder.com/300"
            alt="Placeholder"
            className="mb-6 w-48 h-48 object-cover rounded-full"
          />
          <p className="text-lg font-semibold mb-4">
            "Your journey starts here."
          </p>
          <div className="flex flex-col space-y-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
              Login with Facebook
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full">
              Login with Google
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
