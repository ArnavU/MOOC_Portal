import React from 'react';
import { FiXCircle, FiBook, FiClock, FiCalendar, FiCheckCircle, FiUser } from 'react-icons/fi';

const CourseDetailsModal = ({ student, onClose }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
                className="fixed inset-0 bg-richblack-900/80 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>
            <div className="relative bg-richblack-800 rounded-lg max-w-[85%] w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-richblack-800 p-6 border-b border-richblack-700 flex items-start justify-between z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-richblack-700 flex items-center justify-center overflow-hidden">
                            {student.image ? (
                                <img 
                                    src={student.image} 
                                    alt={`${student.firstName} ${student.lastName}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <FiUser className="text-richblack-300 text-2xl" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-richblack-5">
                                {student.firstName} {student.lastName}'s Courses
                            </h2>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-richblack-300">{student.email}</p>
                                <span className="text-richblack-500">•</span>
                                <p className="text-richblack-300">PRN: {student.prn}</p>
                                <span className="text-richblack-500">•</span>
                                <p className="text-richblack-300">Roll No: {student.rollNumber}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-richblack-700 transition-colors"
                    >
                        <FiXCircle className="text-richblack-300 text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {student.courses.map((course) => (
                            <div 
                                key={course.courseId} 
                                className="bg-richblack-700 rounded-lg overflow-hidden transition-all duration-300"
                            >
                                {/* Course Thumbnail */}
                                <div className="aspect-video relative">
                                    {course.thumbnail ? (
                                        <img 
                                            src={course.thumbnail} 
                                            alt={course.courseName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-richblack-600 flex items-center justify-center">
                                            <FiBook className="text-richblack-300 text-4xl" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            course.status === 'Active' 
                                                ? 'bg-green-500/20 text-green-500' 
                                                : 'bg-red-500/20 text-red-500'
                                        }`}>
                                            {course.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Course Info */}
                                <div className="p-4">
                                    <div className="mb-3">
                                        <h3 className="text-lg font-semibold text-richblack-5 mb-1">
                                            {course.courseName}
                                        </h3>
                                        <p className="text-sm text-richblack-300">{course.courseCode}</p>
                                    </div>

                                    {/* Course Details */}
                                    <div className="space-y-3">
                                        {/* Basic Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-richblack-300" />
                                                <span className="text-sm text-richblack-300">Allocated On:</span>
                                                <span className="text-sm text-richblack-5">
                                                    {formatDate(course.allocatedOn)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-richblack-300" />
                                                <span className="text-sm text-richblack-300">Enrolled:</span>
                                                <span className="text-sm text-richblack-5">
                                                    {formatDate(course.enrollmentDate)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiClock className="text-richblack-300" />
                                                <span className="text-sm text-richblack-300">Valid Until:</span>
                                                <span className="text-sm text-richblack-5">
                                                    {formatDate(course.validityEndDate)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Enrollment Status */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-richblack-300">Enrollment Status:</span>
                                            <span className={`text-sm ${
                                                course.enrollmentStatus === 'Enrolled' 
                                                    ? 'text-green-500' 
                                                    : 'text-yellow-500'
                                            }`}>
                                                {course.enrollmentStatus}
                                            </span>
                                        </div>

                                        {/* Progress */}
                                        {course.progress && (
                                            <div>
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="text-richblack-300">Progress</span>
                                                    <span className="text-richblack-5">
                                                        {course.progress.percentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-richblack-600 rounded-full h-2">
                                                    <div 
                                                        className="bg-yellow-50 h-2 rounded-full transition-all duration-300" 
                                                        style={{ width: `${course.progress.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-richblack-300 mt-1">
                                                    <span>
                                                        {course.progress.completedVideos} of {course.progress.totalVideos} videos
                                                    </span>
                                                    <span>
                                                        {course.progress.detailedPercentage}% completed
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Rating and Review */}
                                        {course.rating && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-richblack-300">Rating:</span>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiCheckCircle
                                                            key={i}
                                                            className={`text-sm ${
                                                                i < course.rating.rating
                                                                    ? 'text-yellow-50'
                                                                    : 'text-richblack-500'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                {course.rating.review && (
                                                    <p className="text-sm text-richblack-300 mt-1">
                                                        "{course.rating.review}"
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsModal; 