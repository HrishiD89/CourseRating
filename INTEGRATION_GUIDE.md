# Frontend-Backend Integration Guide

## 🎯 Current State Analysis

### What You Have:

- ✅ **Backend**: Express server with authentication and course routes
- ✅ **Frontend**: React app with UI pages (Register, Login, CourseList, CourseDetail)
- ❌ **Connection**: Frontend and backend are NOT connected yet
- ❌ **Routing**: Frontend routing is not set up
- ❌ **API Calls**: Frontend pages have mock data, not real API calls

---

## 📋 Steps to Connect Frontend and Backend

### **STEP 1: Set Up Frontend Routing**

**What**: Configure React Router to navigate between pages  
**Why**: Right now your App.jsx just shows "Hello world". We need to set up routes so users can navigate to Register, Login, CourseList, and CourseDetail pages.

**File to modify**: `client/src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import CourseList from "../pages/CourseList";
import CourseDetail from "../pages/CourseDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/course/:id" element={<CourseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**Explanation**:

- `BrowserRouter`: Enables client-side routing (URL changes without page reload)
- `Routes`: Container for all your route definitions
- `Route`: Maps a URL path to a component
- `Navigate`: Redirects users (here, "/" redirects to "/courses")

---

### **STEP 2: Create API Service Layer**

**What**: Create a centralized file to handle all API calls  
**Why**: Instead of writing fetch/axios calls in every component, we create one place to manage all API communication. This makes code reusable, easier to maintain, and easier to update if the backend URL changes.

**File to create**: `client/src/services/api.js`

```javascript
import axios from "axios";

// Base URL for your backend API
const API_BASE_URL = "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
};

// Course API calls
export const courseAPI = {
  getAllCourses: () => api.get("/course/all"),
  getCourseById: (id) => api.get(`/course/${id}`),
  searchCourse: (title) => api.get(`/course/search/${title}`),
};

export default api;
```

**Explanation**:

- **axios.create()**: Creates a configured axios instance with base URL
- **interceptors.request**: Automatically adds JWT token to every request (for protected routes)
- **localStorage.getItem('token')**: Retrieves the saved authentication token
- **Organized exports**: Separate auth and course APIs for clarity

---

### **STEP 3: Create Authentication Context**

**What**: Create a React Context to manage user authentication state globally  
**Why**: Many components need to know if a user is logged in. Instead of passing this data through props everywhere, Context makes it available to any component.

**File to create**: `client/src/context/AuthContext.jsx`

```jsx
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

**Explanation**:

- **createContext**: Creates a context object to share data
- **useState**: Manages user and token state
- **useEffect**: Runs on component mount to check if user is already logged in
- **localStorage**: Browser storage to persist login across page refreshes
- **login/logout**: Functions to update authentication state
- **useAuth hook**: Custom hook for easy access to auth context in components

---

### **STEP 4: Wrap App with AuthProvider**

**What**: Wrap your App component with AuthProvider  
**Why**: This makes authentication state available to all components in your app.

**File to modify**: `client/src/main.jsx`

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
```

---

### **STEP 5: Connect Register Page to Backend**

**What**: Update Register.jsx to call the backend API  
**Why**: Currently it just logs to console. We need to actually send data to the server.

**File to modify**: `client/pages/Register.jsx`

Add these imports at the top:

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../src/services/api";
import { useAuth } from "../src/context/AuthContext";
```

Update the handleSubmit function:

```jsx
const navigate = useNavigate();
const { login } = useAuth();
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await authAPI.register(formData);

    // Save token and user data
    login(response.data.user, response.data.token);

    // Redirect to courses page
    navigate("/courses");
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};
```

Add error display in JSX (after the form title):

```jsx
{
  error && (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  );
}
```

Update button to show loading state:

```jsx
<button
  type="submit"
  disabled={loading}
  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition duration-200"
>
  {loading ? "Creating Account..." : "Sign Up"}
</button>
```

**Explanation**:

- **async/await**: Modern way to handle asynchronous operations
- **try/catch**: Error handling for API calls
- **navigate**: Programmatically redirect user after successful registration
- **loading state**: Prevents multiple submissions and shows feedback
- **error state**: Displays error messages to user

---

### **STEP 6: Connect Login Page to Backend**

**What**: Create Login.jsx and connect it to the backend  
**Why**: Users need to be able to log in with existing accounts.

**File to create**: `client/pages/Login.jsx`

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../src/services/api";
import { useAuth } from "../src/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      login(response.data.user, response.data.token);
      navigate("/courses");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition duration-200"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

### **STEP 7: Connect CourseList Page to Backend**

**What**: Update CourseList.jsx to fetch real courses from the backend  
**Why**: Replace mock data with actual data from your database.

**File to modify**: `client/pages/CourseList.jsx`

```jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseAPI } from "../src/services/api";
import { useAuth } from "../src/context/AuthContext";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      setCourses(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired or invalid
        logout();
        navigate("/login");
      } else {
        setError("Failed to load courses");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      try {
        const response = await courseAPI.searchCourse(value);
        setCourses(response.data);
      } catch (err) {
        console.error("Search failed:", err);
      }
    } else {
      fetchCourses();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Available Courses
          </h1>
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={handleSearch}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center text-gray-600 mt-12">
            No courses found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {course.courseCode}
                  </span>
                  <div className="flex items-center text-yellow-500 text-sm font-bold">
                    ★ {course.averageRating?.toFixed(1) || "N/A"}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Instructor: {course.instructor}
                </p>

                <Link
                  to={`/course/${course._id}`}
                  className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Explanation**:

- **useEffect**: Fetches courses when component mounts
- **useState**: Manages courses, loading, and error states
- **Error handling**: Checks for 401 (unauthorized) and redirects to login
- **Search functionality**: Calls search API as user types
- **Logout button**: Clears auth state and redirects

---

### **STEP 8: Connect CourseDetail Page to Backend**

**What**: Update CourseDetail.jsx to fetch course details  
**Why**: Show real course information based on the ID in the URL.

**File to modify**: `client/pages/CourseDetail.jsx`

```jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseAPI } from "../src/services/api";
import { useAuth } from "../src/context/AuthContext";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      const response = await courseAPI.getCourseById(id);
      setCourse(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      } else {
        setError("Failed to load course details");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading course details...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">
          {error || "Course not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-blue-600 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-blue-500 text-blue-50 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {course.courseCode}
              </span>
              <h1 className="text-4xl font-bold mt-3">{course.title}</h1>
              <p className="mt-2 text-blue-100 text-lg">
                Instructor: {course.instructor}
              </p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-3xl font-bold">
                {course.averageRating?.toFixed(1) || "N/A"}
              </div>
              <div className="text-yellow-400 text-lg">★★★★☆</div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                About this Course
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {course.description}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Course Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-700">
                  <strong>Department:</strong> {course.department}
                </p>
                <p className="text-gray-700">
                  <strong>Credits:</strong> {course.credits}
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar Action */}
          <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-200">
            <div className="mb-4">
              <span className="block text-sm text-gray-500">Credits</span>
              <span className="text-xl font-bold text-gray-900">
                {course.credits} Credits
              </span>
            </div>

            <button
              onClick={() => navigate("/courses")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition mb-2"
            >
              Back to Courses
            </button>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition transform hover:-translate-y-0.5">
              Enroll Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### **STEP 9: Add Protected Routes**

**What**: Create a component to protect routes that require authentication  
**Why**: Prevent unauthenticated users from accessing course pages.

**File to create**: `client/src/components/ProtectedRoute.jsx`

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
```

Update `App.jsx` to use ProtectedRoute:

```jsx
import ProtectedRoute from './components/ProtectedRoute';

// Wrap protected routes:
<Route path="/courses" element={
  <ProtectedRoute>
    <CourseList />
  </ProtectedRoute>
} />
<Route path="/course/:id" element={
  <ProtectedRoute>
    <CourseDetail />
  </ProtectedRoute>
} />
```

**Explanation**:

- **ProtectedRoute**: Wrapper component that checks authentication
- **Navigate**: Redirects to login if not authenticated
- **loading state**: Prevents flash of wrong content while checking auth

---

### **STEP 10: Configure CORS and Start Backend**

**What**: Make sure your backend accepts requests from frontend  
**Why**: By default, browsers block requests from different origins (ports) for security.

Your backend already has CORS enabled (`app.use(cors())`), but make sure your `.env` file has:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start your backend:

```bash
cd server
npm run dev
```

---

## 🚀 Testing the Complete Flow

1. **Start Backend**: `cd server && npm run dev` (should run on port 5000)
2. **Start Frontend**: `cd client && npm run dev` (should run on port 5173)
3. **Test Registration**:
   - Go to `http://localhost:5173/register`
   - Fill in the form
   - Should redirect to courses page after successful registration
4. **Test Login**:
   - Go to `http://localhost:5173/login`
   - Login with registered credentials
5. **Test Course List**:
   - Should see courses from your database
   - Try the search functionality
6. **Test Course Detail**:
   - Click "View Details" on any course
   - Should show full course information

---

## 🔍 Common Issues and Solutions

### Issue 1: "Network Error" or "Failed to fetch"

**Cause**: Backend not running or wrong URL  
**Solution**: Make sure backend is running on port 5000

### Issue 2: "401 Unauthorized"

**Cause**: Token missing or invalid  
**Solution**: Check if token is being saved in localStorage and sent in headers

### Issue 3: CORS errors

**Cause**: Backend not allowing frontend origin  
**Solution**: Backend already has `cors()` middleware, should work

### Issue 4: "Cannot GET /course/all"

**Cause**: Routes not matching  
**Solution**: Check that backend routes match API calls exactly

---

## 📚 Key Concepts You Learned

1. **React Router**: Client-side routing for SPAs
2. **Axios**: HTTP client for API calls
3. **Context API**: Global state management
4. **JWT Authentication**: Token-based auth flow
5. **Protected Routes**: Restricting access to authenticated users
6. **Async/Await**: Handling asynchronous operations
7. **Error Handling**: Try/catch for API errors
8. **Loading States**: Better UX during data fetching
9. **localStorage**: Persisting data in browser
10. **CORS**: Cross-origin resource sharing

---

## 🎓 Next Steps

After completing these steps, you can add:

- Course enrollment functionality
- Rating and review system
- User profile page
- Course filtering and sorting
- Pagination for course list
- Form validation
- Better error messages
- Loading skeletons
