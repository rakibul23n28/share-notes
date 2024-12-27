import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/Helper.js";

// Create the AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to handle login
  const login = async (email, password) => {
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      console.log("Backend response:", data);

      // Store user and token in localStorage
      const userWithToken = { ...data.user, token: data.token };
      setUser(userWithToken);
      localStorage.setItem("user", JSON.stringify(userWithToken));

      return { success: true };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.response?.data?.msg || "Login failed. Please try again.",
      };
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {});
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Retrieve user data on initial load and validate token
  useEffect(() => {
    const initializeUser = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        try {
          // Validate token with backend
          const { data } = await axios.get("/api/auth/validate", {
            headers: getAuthHeaders(), // Pass token in header
            withCredentials: true,
          });

          if (data.isValid) {
            setUser(parsedUser); // Set user if token is valid
          } else {
            localStorage.removeItem("user"); // Remove user if token is invalid
          }
        } catch (error) {
          console.error("Error validating token:", error);
          localStorage.removeItem("user"); // Clear user if validation fails
        }
      }
      setLoading(false); // Finish loading after check
    };

    initializeUser();
  }, []);

  // Function to handle profile update
  const updateProfile = async (editData) => {
    if (!editData.username || !editData.email) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const response = await axios.put(`/api/user/update`, editData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Update user and token after profile update
      const updatedUserWithToken = {
        ...response.data.user,
        token: response.data.token,
      };
      setUser(updatedUserWithToken);
      localStorage.setItem("user", JSON.stringify(updatedUserWithToken));

      return { success: true };
    } catch (error) {
      console.error("Failed to update profile:", error);
      return {
        success: false,
        message:
          error.response?.data?.msg ||
          "Profile update failed. Please try again.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, setUser, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
