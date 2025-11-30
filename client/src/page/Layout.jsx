import React from "react";
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <nav>
        <Link to="/" style={{ marginRight: "10px" }}>
          Login
        </Link>
        <Link to="/register" style={{ marginRight: "10px" }}>
          Register
        </Link>
        <Link to="/courses" style={{ marginRight: "10px" }}>
          Courses
        </Link>
        <Link to="/about" style={{ marginRight: "10px" }}>
          About
        </Link>
      </nav>

      <hr />

      <Outlet />

      <hr />
      <p>FootBar</p>
    </div>
  );
};

export default Layout;
