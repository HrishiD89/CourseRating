import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { jwtDecode } from "jwt-decode";

function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Optional: Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setUser(null);
          } else {
            setIsLoggedIn(true);
            setUser(decoded);
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, user, setUser, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
