import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { fetchDepartmentCourses, getFirstSectionSubSectionIds } from "../../../../../services/operations/courseDetailsAPI";
import { FiBook, FiUsers, FiClock, FiTag, FiEye, FiImage, FiUpload, FiEdit2, FiCheck, FiAlertCircle } from "react-icons/fi";
import CourseDetailsModal from "./CourseDetailsModal";
import { useNavigate } from "react-router";
import { FaBookOpen } from "react-icons/fa";

const DepartmentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoursesData();
  }, []);

  const fetchCoursesData = async () => {
    try {
      setLoading(true);
      const response = await fetchDepartmentCourses();
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to fetch department courses");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
  };

  const handleViewCourse = async(courseId) => {
    const [section, subSection] = await getFirstSectionSubSectionIds(courseId);
    if(section && subSection) {
      navigate(`/dashboard/enrolled-courses/view-course/${courseId}/section/${section}/sub-section/${subSection}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-richblack-5"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex justify-center items-center mb-8">
        <h1 className="text-3xl font-semibold text-center text-richblack-5">Department Courses</h1>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center text-richblack-100 py-12">
          <div className="text-2xl mb-2">No courses found in your department</div>
          <p className="text-richblack-300">Courses will appear here once they are created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div
              key={course._id}
              className="relative bg-richblack-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-richblack-700"
            >
              <div className="relative h-[240px] w-full">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="w-full h-full object-contain bg-richblack-900"
                  />
                ) : (
                  <div className="w-full h-full bg-richblack-700 flex items-center justify-center">
                    <FiImage className="text-4xl text-richblack-300" />
                  </div>
                )}
                <button
                  onClick={() => handleViewDetails(course)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-richblack-700 hover:bg-richblack-600 transition-all duration-200 group"
                  title="View Details"
                >
                  <FiEye className="text-richblack-5 group-hover:text-yellow-50 transition-colors duration-200" />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-richblack-800 text-richblack-5 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    View Details
                  </span>
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-2xl font-semibold text-richblack-5 bg-gradient-to-r from-richblack-100 to-richblack-200 bg-clip-text text-transparent">
                      {course.courseName}
                    </h2>
                    <div className="flex flex-col items-end relative">
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                          course.status === 'Published' 
                            ? 'bg-yellow-500/20 text-yellow-200' 
                            : 'bg-red-500/20 text-red-200'
                        }`}>
                          {course.status === 'Published' ? <FiUpload className="text-sm" /> : <FiEdit2 className="text-sm" />}
                          {course.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                          course.approved 
                            ? 'bg-green-500/20 text-green-200' 
                            : 'bg-red-500/20 text-red-200'
                        }`}>
                          {course.approved ? <FiCheck className="text-sm" /> : <FiAlertCircle className="text-sm" />}
                          {course.approved ? 'Approved' : 'Not Approved'}
                        </span>
                      </div>
                      <button className="flex absolute top-full mt-4 items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                        onClick={() => handleViewCourse(course._id)}
                      >
                        <FaBookOpen className="text-xl" />
                        View Course
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center text-richblack-300">
                    <span className="text-sm font-medium">{course.courseCode}</span>
                  </div>
                </div>
                
                <p className="text-richblack-200 text-base mb-4 line-clamp-2">
                  {course.courseDescription}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center text-richblack-200 text-base">
                    <FiBook className="mr-3 text-yellow-200" />
                    <span>Category: {course.category?.name}</span>
                  </div>
                  <div className="flex items-center text-richblack-200 text-base">
                    <FiClock className="mr-3 text-blue-200" />
                    <span>Duration: {course.duration}</span>
                  </div>
                  <div className="flex items-center text-richblack-200 text-base">
                    <FiUsers className="mr-3 text-pink-200" />
                    <span>Instructor: {course.instructor?.firstName} {course.instructor?.lastName}</span>
                  </div>
                  {course.tag && course.tag.length > 0 && (
                    <div className="flex items-center text-richblack-200 text-base">
                      <FiTag className="mr-3 text-purple-200" />
                      <div className="flex flex-wrap gap-2">
                        {course.tag.map((tag, index) => (
                          <span key={index} className="bg-richblack-700 px-2 py-0.5 rounded-full text-sm border border-richblack-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCourse && (
        <CourseDetailsModal 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)} 
        />
      )}
    </div>
  );
};

export default DepartmentCourses; 