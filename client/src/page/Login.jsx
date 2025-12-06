import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setIsLoggedIn } = useContext(AuthContext);

  const BACKEND_API = import.meta.env.VITE_BACKEND_API;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      email,
      password,
    };

    try {
      const res = await axios.post(`${BACKEND_API}/auth/login`, user);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setIsLoggedIn(true);
        setTimeout(() => {
          navigate("/courses");
        });
      }
    } catch (err) {
      alert(err.response.data.error);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 flex-col">
      <div className="mb-8">
        <h1 className="text-3xl text-gray-800 max-w-sm text-center">
          Log in to continue your learning journey
        </h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md space-y-4 flex flex-col"
      >
        <input
          className="w-full p-2 border border-gray-300 rounded
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          placeholder="Email"
          name="email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          required
        />
        <input
          className="w-full p-2 border border-gray-300 rounded
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          name="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded
                   hover:bg-blue-700 transition cursor-pointer"
        >
          Login
        </button>
      </form>

      <div className="mt-4">
        <p>
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
