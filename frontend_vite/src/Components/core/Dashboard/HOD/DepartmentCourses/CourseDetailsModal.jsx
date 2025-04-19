import React from "react";
import { FiX, FiBook, FiUsers, FiClock, FiTag, FiImage, FiUpload, FiEdit2, FiCheck, FiAlertCircle } from "react-icons/fi";

const CourseDetailsModal = ({ course, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 rounded-xl overflow-hidden bg-richblack-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-richblack-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-richblack-700">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-semibold text-richblack-5">{course.courseName}</h2>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-richblack-700 hover:bg-richblack-600 transition-all duration-200"
            >
              <FiX className="text-richblack-5" />
            </button>
          </div>

          <div className="relative h-[400px] w-full mb-8 rounded-lg overflow-hidden border border-richblack-700">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.courseName}
                className="w-full h-full object-contain bg-richblack-900"
              />
            ) : (
              <div className="w-full h-full bg-richblack-700 flex items-center justify-center">
                <FiImage className="text-6xl text-richblack-300" />
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="flex gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                course.status === 'Published' 
                  ? 'bg-yellow-500/20 text-yellow-200' 
                  : 'bg-red-500/20 text-red-200'
              }`}>
                {course.status === 'Published' ? <FiUpload className="text-sm" /> : <FiEdit2 className="text-sm" />}
                {course.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                course.approved 
                  ? 'bg-green-500/20 text-green-200' 
                  : 'bg-red-500/20 text-red-200'
              }`}>
                {course.approved ? <FiCheck className="text-sm" /> : <FiAlertCircle className="text-sm" />}
                {course.approved ? 'Approved' : 'Not Approved'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-richblack-5 mb-3">Course Information</h3>
                  <p className="text-richblack-200 text-base">{course.courseDescription}</p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-richblack-5 mb-3">What You'll Learn</h3>
                  <p className="text-richblack-200 text-base whitespace-pre-line">{course.whatYouWillLearn}</p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-richblack-5 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tag?.map((tag, index) => (
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
                  <p className="text-richblack-200 text-base">{course.category?.name}</p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-richblack-5 mb-3">Duration</h3>
                  <p className="text-richblack-200 text-base">{course.duration} weeks</p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-richblack-5 mb-3">Instructor</h3>
                  <p className="text-richblack-200 text-base">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                  <p className="text-richblack-300 text-sm">{course.instructor?.email}</p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-richblack-5 mb-3">Enrolled Students</h3>
                  <p className="text-richblack-200 text-base">{course.studentsEnrolled?.length || 0} students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsModal; 