import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      name,
      email,
      password,
    };
    try {
      console.log(user);

      const res = await axios.post(`${BACKEND_URL}/auth/register`, user);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setTimeout(() => {
          navigate("/courses");
        }, 3000);
      }

      handleClear();
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  };

  const handleClear = () => {
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-gray-100">
      <div className="mb-4">
        <h1 className="text-2xl text-gray-800">Sign up with email</h1>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col bg-white p-6 rounded-md shadow-md space-y-4">
        <input
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
        className="w-full p-2 border border-gray-300 rounded
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          required
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
        className="w-full border border-gray-300 p-2 rounded focus:outline-0 focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded
                   hover:bg-blue-700 transition cursor-pointer">Register</button>
      </form>

      <div className="mt-4">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
