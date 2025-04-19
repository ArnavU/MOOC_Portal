import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { fetchPendingCourses, approveCourse } from "../../../../../services/operations/courseDetailsAPI";
import { FiCheck, FiEye, FiClock, FiUsers, FiBook, FiTag, FiX, FiImage } from "react-icons/fi";

const CourseApprovals = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchPendingCoursesData();
  }, []);

  const fetchPendingCoursesData = async () => {
    try {
      setLoading(true);
      const response = await fetchPendingCourses();
      setPendingCourses(response.data);
    } catch (error) {
      toast.error("Failed to fetch pending courses");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      await approveCourse(courseId);
      toast.success("Course approved successfully");
      fetchPendingCoursesData();
    } catch (error) {
      toast.error("Failed to approve course");
    }
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-richblack-5"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-center items-center mb-8">
        <h1 className="text-3xl font-semibold text-center text-richblack-5">Course Approvals</h1>
      </div>
      
      {pendingCourses.length === 0 ? (
        <div className="text-center text-richblack-100 py-12">
          <div className="text-2xl mb-2">No pending courses for approval</div>
          <p className="text-richblack-300">All courses have been reviewed and approved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {pendingCourses.map((course) => (
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
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-semibold text-richblack-5">
                    {course.courseName}
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(course)}
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-richblack-700 hover:bg-richblack-600 transition-all duration-200"
                      title="View Details"
                    >
                      <FiEye className="text-richblack-5" />
                    </button>
                    <button
                      onClick={() => handleApprove(course._id)}
                      className="p-2.5 rounded-full bg-green-600 hover:bg-green-500 transition-all duration-200"
                      title="Approve Course"
                    >
                      <FiCheck className="text-richblack-5" />
                    </button>
                  </div>
                </div>
                
                <p className="text-richblack-200 text-base mb-6 line-clamp-2">
                  {course.courseDescription}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center text-richblack-200 text-base">
                    <FiBook className="mr-3 text-yellow-200" />
                    <span>Category: {course.category?.name}</span>
                  </div>
                  <div className="flex items-center text-richblack-200 text-base">
                    <FiClock className="mr-3 text-blue-200" />
                    <span>Duration: {course.duration} weeks</span>
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
                          <span key={index} className="bg-richblack-700 px-3 py-1 rounded-full text-sm border border-richblack-600">
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
        <div className="fixed inset-0 bg-richblack-900 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-richblack-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-richblack-700">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-2xl font-semibold text-richblack-5">
                  Course Details
                </h2>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-2.5 rounded-full bg-richblack-700 hover:bg-richblack-600 transition-all duration-200"
                >
                  <FiX className="text-richblack-5" />
                </button>
              </div>

              <div className="relative h-[400px] w-full mb-8 rounded-lg overflow-hidden border border-richblack-700">
                {selectedCourse.thumbnail ? (
                  <img
                    src={selectedCourse.thumbnail}
                    alt={selectedCourse.courseName}
                    className="w-full h-full object-contain bg-richblack-900"
                  />
                ) : (
                  <div className="w-full h-full bg-richblack-700 flex items-center justify-center">
                    <FiImage className="text-6xl text-richblack-300" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium text-richblack-5 mb-3">Course Information</h3>
                    <p className="text-richblack-200 text-base">{selectedCourse.courseDescription}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium text-richblack-5 mb-3">What You'll Learn</h3>
                    <p className="text-richblack-200 text-base whitespace-pre-line">{selectedCourse.whatYouWillLearn}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-richblack-5 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.tag?.map((tag, index) => (
                        <span key={index} className="bg-richblack-700 px-4 py-1.5 rounded-full text-sm border border-richblack-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium text-richblack-5 mb-3">Category</h3>
                    <p className="text-richblack-200 text-base">{selectedCourse.category?.name}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-richblack-5 mb-3">Duration</h3>
                    <p className="text-richblack-200 text-base">{selectedCourse.duration} weeks</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-richblack-5 mb-3">Instructor</h3>
                    <p className="text-richblack-200 text-base">
                      {selectedCourse.instructor?.firstName} {selectedCourse.instructor?.lastName}
                    </p>
                    <p className="text-richblack-300 text-sm">{selectedCourse.instructor?.email}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-richblack-5 mb-3">Department</h3>
                    <p className="text-richblack-200 text-base">{selectedCourse.department?.name}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => handleApprove(selectedCourse._id)}
                  className="px-6 py-2.5 rounded-lg bg-green-600 text-richblack-5 hover:bg-green-500 transition-all duration-200 text-lg font-medium"
                >
                  Approve Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseApprovals; 