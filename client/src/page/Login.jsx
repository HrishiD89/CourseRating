import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        setTimeout(() => {
          navigate("/courses");
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <form onChange={handleSubmit}>
        <input
          type="text"
          placeholder="Email"
          name="email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Password"
          name="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
