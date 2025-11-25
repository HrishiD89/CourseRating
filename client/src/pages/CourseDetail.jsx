import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI, ratingAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import StarRating from '../components/StarRating';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Enrollment state
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  
  // Rating state
  const [userRating, setUserRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

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

  const fetchEnrollmentStatus = useCallback(async () => {
    try {
      const response = await enrollmentAPI.getEnrollmentStatus(id);
      setIsEnrolled(response.data.enrolled);
    } catch (err) {
      console.error('Failed to fetch enrollment status:', err);
    }
  }, [id]);

  const fetchUserRating = useCallback(async () => {
    try {
      const response = await ratingAPI.getMyRating(id);
      if (response.data.rated) {
        setUserRating(response.data.rating);
      }
    } catch (err) {
      console.error('Failed to fetch user rating:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetail();
    fetchEnrollmentStatus();
    fetchUserRating();
  }, [fetchCourseDetail, fetchEnrollmentStatus, fetchUserRating]);

  const handleEnroll = async () => {
    setEnrollmentLoading(true);
    try {
      await enrollmentAPI.enrollInCourse(id);
      setIsEnrolled(true);
      alert('Successfully enrolled in the course!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleDrop = async () => {
    if (!confirm('Are you sure you want to drop this course?')) {
      return;
    }
    
    setEnrollmentLoading(true);
    try {
      await enrollmentAPI.dropCourse(id);
      setIsEnrolled(false);
      setUserRating(0); // Reset rating when dropped
      alert('Successfully dropped the course');
      // Refresh course data to update average rating
      fetchCourseDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to drop course');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleRatingChange = async (newRating) => {
    if (!isEnrolled) {
      alert('You must be enrolled in this course to rate it');
      return;
    }

    setRatingLoading(true);
    try {
      await ratingAPI.rateCourse(id, newRating);
      setUserRating(newRating);
      // Refresh course data to update average rating
      fetchCourseDetail();
      alert('Rating submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
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
              <StarRating rating={course.avgRating || 0} readonly size="small" />
              <div className="text-xs text-blue-100 mt-1">
                {course.totalRatings || 0} {course.totalRatings === 1 ? 'rating' : 'ratings'}
              </div>
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

            {/* Rating Section - Only show if enrolled */}
            {isEnrolled && (
              <section className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Rate This Course</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {userRating > 0 
                    ? 'You can update your rating anytime' 
                    : 'Share your experience with this course'}
                </p>
                <div className="flex items-center gap-4">
                  <StarRating 
                    rating={userRating} 
                    onRatingChange={handleRatingChange}
                    size="large"
                  />
                  {ratingLoading && (
                    <span className="text-sm text-gray-500">Submitting...</span>
                  )}
                </div>
                {userRating > 0 && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    ✓ You rated this course {userRating} star{userRating !== 1 ? 's' : ''}
                  </p>
                )}
              </section>
            )}
          </div>

          {/* Sidebar Action */}
          <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-200">
            <div className="mb-4">
              <span className="block text-sm text-gray-500">Credits</span>
              <span className="text-xl font-bold text-gray-900">{course.credits} Credits</span>
            </div>
            
            {/* Enrollment Status Badge */}
            {isEnrolled && (
              <div className="mb-4 bg-green-100 border border-green-300 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                  <span className="text-lg">✓</span> Enrolled
                </p>
              </div>
            )}
            
            <button 
              onClick={() => navigate('/courses')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition mb-2"
            >
              Back to Courses
            </button>
            
            {!isEnrolled ? (
              <button 
                onClick={handleEnroll}
                disabled={enrollmentLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg shadow-md transition transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {enrollmentLoading ? 'Enrolling...' : 'Enroll Now'}
              </button>
            ) : (
              <button 
                onClick={handleDrop}
                disabled={enrollmentLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 rounded-lg shadow-md transition"
              >
                {enrollmentLoading ? 'Dropping...' : 'Drop Course'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}