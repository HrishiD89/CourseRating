import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  login: (userData) => api.post("/auth/login", userData),
};

// Course API calls
export const courseAPI = {
  getAllCourses: () => api.get("/course/all"),
  getCourseById: (id) => api.get(`/course/${id}`),
  searchCourse: (title) => api.get(`/course/search/${title}`),
};

// Enrollment API calls
export const enrollmentAPI = {
  enrollInCourse: (courseId) => api.post(`/enrollment/enroll/${courseId}`),
  dropCourse: (courseId) => api.delete(`/enrollment/drop/${courseId}`),
  getEnrollmentStatus: (courseId) => api.get(`/enrollment/status/${courseId}`),
  getMyEnrollments: () => api.get("/enrollment/my-courses"),
};

// Rating API calls
export const ratingAPI = {
  rateCourse: (courseId, rating) =>
    api.post(`/rating/rate/${courseId}`, { rating }),
  getMyRating: (courseId) => api.get(`/rating/my-rating/${courseId}`),
};
