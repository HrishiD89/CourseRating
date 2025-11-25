import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourseDetail = useCallback(async () => {
    try {
      const response = await courseAPI.getCourseById(id);
      setCourse(response.data.course);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to load course details');
      }
    } finally {
      setLoading(false);
    }
  }, [id, logout, navigate]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

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
        <div className="text-xl text-red-600">{error || 'Course not found'}</div>
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
              <p className="mt-2 text-blue-100 text-lg">Instructor: {course.instructor}</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-3xl font-bold">{course.avgRating?.toFixed(1) || 'N/A'}</div>
              <div className="text-yellow-400 text-lg">★★★★☆</div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">About this Course</h3>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </section>
            
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Course Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-700"><strong>Department:</strong> {course.department}</p>
                <p className="text-gray-700"><strong>Credits:</strong> {course.credits}</p>
              </div>
            </section>
          </div>

          {/* Sidebar Action */}
          <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-200">
            <div className="mb-4">
              <span className="block text-sm text-gray-500">Credits</span>
              <span className="text-xl font-bold text-gray-900">{course.credits} Credits</span>
            </div>
            
            <button 
              onClick={() => navigate('/courses')}
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