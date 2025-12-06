import React from "react";
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex gap-6 p-4">
          <Link className="text-gray-600 hover:text-blue-600" to="/">Login</Link>
          <Link className="text-gray-600 hover:text-blue-600" to="/register">Register</Link>
          <Link className="text-gray-600 hover:text-blue-600" to="/courses">Courses</Link>
          <Link className="text-gray-600 hover:text-blue-600" to="/about">About</Link>
        </div>
      </nav>

      {/* Page Content */}
        <Outlet />

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 p-4">
        FootBar
      </footer>

    </div>
  );
};


export default Layout;
