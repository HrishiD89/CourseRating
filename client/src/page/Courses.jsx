import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import authInstance from "../utils/axiosInstance";
import axios from "axios";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    console.log(import.meta.env.VITE_BACKEND_API);

    const handleFetchCourses = async () => {
      setLoading(true);
      try {
        // const res = await authInstance.get("/course/all");
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/courses/all`
        );
        console.log(res);
        setCourses(res.data.courses);
        setLoading(false);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    handleFetchCourses();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Available Courses
      </h1>

      {loading ? (
        <div className="text-center text-gray-500 mt-10">
          Loading courses...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100"
            >
              {/* Thumbnail */}
              <div className="h-48 w-full overflow-hidden bg-gray-200 relative">
                <img
                  src={c.courseThumbnail}
                  alt={c.courseName}
                  decoding="async"
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/600x400?text=No+Image"; // Fallback image
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Course
                  </span>
                  <div className="flex items-center text-yellow-500 text-sm font-bold">
                    <span>★</span>
                    <span className="ml-1 text-gray-700">
                      {c.rating || "0.0"}
                    </span>
                    <span className="text-gray-400 text-xs font-normal ml-1">
                      ({c.noOfRating || 0})
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
                  {c.courseName}
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  by{" "}
                  <span className="font-medium text-gray-800">{c.author}</span>
                </p>

                {/* Footer / Price / Action */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">Free</span>
                  <button
                    onClick={() => navigate(`/courses/${c._id}`)}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
