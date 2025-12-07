import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import LinkButton from "./LinkButton";

const Navbar = () => {
  const { isLoggedIn, setIsLoggedIn, user, setUser } = useContext(AuthContext);
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto flex gap-4 p-2 items-center">
        <LinkButton
          className="text-gray-600 hover:bg-blue-100 transition duration-300 hover:text-blue-500"
          to="/courses"
        >
          Courses
        </LinkButton>
        <LinkButton
          className="text-gray-600 hover:bg-blue-100 transition duration-300 hover:text-blue-500"
          to="/about"
        >
          About
        </LinkButton>
        {!isLoggedIn ? (
          <>
            <LinkButton
              to="/login"
              className="text-blue-500 font-bold hover:bg-gray-200 border border-blue-500 "
            >
              Login
            </LinkButton>

            <LinkButton
              className="text-white bg-blue-500 hover:bg-blue-600 "
              to="/register"
            >
              Register
            </LinkButton>
          </>
        ) : (
          <>
            <span className="text-gray-700 font-medium mr-4">
              Hello, {user?.name} 👋
            </span>

            <LinkButton
              onClick={() => {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                setUser(null); // Clear user data
              }}
              className="text-gray-600 hover:bg-red-100 hover:text-red-500"
              to="/login"
            >
              Logout
            </LinkButton>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
