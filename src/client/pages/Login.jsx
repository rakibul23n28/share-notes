import { useState, useContext } from "react";
import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission here, e.g., send data to server
    setErrorMessage("");
    const { success, message } = await login(email, password);
    if (success) {
      navigate("/");
    } else {
      setErrorMessage(message);
    }
  };

  return (
    <Layout>
      <div className="flex h-screen w-full">
        {/* Left Side */}
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

        {/* Right Side */}
        <div className="w-1/2 bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={handleSubmit}>
              {errorMessage && (
                <p className="text-red-500 mb-4">{errorMessage}</p>
              )}
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
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Login
                </button>
              </div>
            </form>
            <div className="text-center mt-4">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="underline hover:text-green-500">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
