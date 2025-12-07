import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import authInstance from "../utils/axiosInstance";
import CourseRating from "../components/CourseRating";

const CourseInfo = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const { id } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrolledCourse = async () => {
      try {
        const res = await authInstance.get(`/courses/enrolled/${id}`);
        setEnrolled(res.data.enrolled);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEnrolledCourse();
  }, [id]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/courses/${id}`
        );
        setCourse(res.data.course);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  const handleEnroll = async (e) => {
    e.preventDefault();

    try {
      await authInstance.post(`/courses/enroll`, { courseId: id });
      setEnrolled(true);
      alert("Course enrolled successfully");
    } catch (err) {
      console.error(err);
      alert("You are not enrolled in this course");
      navigate("/login");
    }
  };

  const handleDropCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await authInstance.post(`/courses/drop`, { courseId: id });
      setEnrolled(false);

      // Update course rating stats immediately
      setCourse((prevCourse) => ({
        ...prevCourse,
        rating: res.data.rating,
        noOfRating: res.data.noOfRating,
      }));

      alert("Course dropped successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to drop course");
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!course) return <div className="text-center py-12">Course not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back navigation */}
      <div className="mb-4">
        <Link
          to="/courses"
          className="text-blue-600 hover:underline flex items-center"
        >
          ← Back to Courses
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
        {/* Left side – course details */}
        <div className="flex-1">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {course.courseName}
            </h1>
            <p className="text-gray-700  line-clamp-4">
              {course.courseDescription}
            </p>
            <p className="text-sm text-gray-500">
              Created by{" "}
              <span className="font-medium text-gray-700">{course.author}</span>
            </p>
            <div className="flex items-center text-yellow-500 text-sm font-bold">
              <span>★</span>
              <span className="ml-1 text-gray-700">
                {course.rating || "0.0"}
              </span>
              <span className="text-gray-400 text-xs font-normal ml-1">
                ({course.noOfRating || 0})
              </span>
            </div>
          </div>
          {enrolled && <CourseRating course={course} setCourse={setCourse} />}
        </div>

        {/* Right side – image, enroll button, features */}
        <div className="w-full md:w-80 flex flex-col gap-4 border border-gray-200 rounded-lg p-4 shadow-sm bg-white/80">
          <div className="w-full h-48 overflow-hidden rounded">
            <img
              src={course.courseThumbnail}
              alt="Course thumbnail"
              className="w-full h-full object-cover"
            />
          </div>

          {enrolled ? (
            <button
              onClick={handleDropCourse}
              className=" cursor-pointer w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
            >
              Drop Course
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              className=" cursor-pointer w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Enroll Now
            </button>
          )}
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-2">This course includes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>10 hours on‑demand video</li>
              <li>Full lifetime access</li>
              <li>Access on mobile and TV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseInfo;
