// src/components/Layout.js
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <div className="navbar sticky top-0 h-screen">
        <Navbar />
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};

export default Layout;
