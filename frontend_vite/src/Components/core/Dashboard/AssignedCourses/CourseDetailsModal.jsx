import React from 'react';
import { FiX, FiUsers, FiBook, FiCheckCircle, FiXCircle, FiCalendar, FiClock, FiBarChart2, FiUser, FiHash, FiBookOpen, FiAward } from 'react-icons/fi';

const CourseDetailsModal = ({ course, onClose }) => {
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
            <div className="fixed inset-0 bg-richblack-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-richblack-800 rounded-lg max-w-[75%] w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-richblack-800 pl-6 pt-4 pb-1 border-b border-richblack-700 flex items-start justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold text-richblack-5 flex items-center gap-2">
                            <FiBookOpen className="text-yellow-50" />
                            {course.courseName}
                        </h2>
                        <p className="text-richblack-300 flex items-center gap-2">
                            <FiHash className="text-yellow-50" />
                            {course.courseCode}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-richblack-700 transition-colors"
                    >
                        <FiX className="text-richblack-300 text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Course Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-richblack-700/50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-richblack-5 mb-3 flex items-center gap-2">
                                <FiBook className="text-yellow-50" />
                                Course Details
                            </h3>
                            <div className="space-y-2">
                                <p className="text-richblack-300">
                                    <span className="font-medium text-richblack-5">Description:</span> {course.courseDescription}
                                </p>
                                <p className="text-richblack-300 flex items-center gap-2">
                                    <span className="font-medium text-richblack-5">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                                        course.status === "Published" 
                                            ? "bg-caribbeangreen-200/20 text-caribbeangreen-200" 
                                            : "bg-pink-200/20 text-pink-200"
                                    }`}>
                                        {course.status === "Published" ? (
                                            <FiCheckCircle className="text-lg" />
                                        ) : (
                                            <FiXCircle className="text-lg" />
                                        )}
                                        {course.status}
                                    </span>
                                </p>
                                <p className="text-richblack-300 flex items-center gap-2">
                                    <span className="font-medium text-richblack-5">Approval:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        course.approved 
                                            ? "bg-yellow-50/20 text-yellow-50" 
                                            : "bg-pink-200/20 text-pink-200"
                                    }`}>
                                        {course.approved ? "Approved" : "Not Approved"}
                                    </span>
                                </p>
                                <p className="text-richblack-300 flex items-center gap-2">
                                    <span className="font-medium text-richblack-5">Category:</span>
                                    {course.category?.name || "Not specified"}
                                </p>
                                <p className="text-richblack-300 flex items-center gap-2">
                                    <span className="font-medium text-richblack-5">Department:</span>
                                    {course.department?.name || "Not specified"}
                                </p>
                            </div>
                        </div>

                        {/* Enrollment Statistics */}
                        <div className="bg-richblack-700/50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-richblack-5 mb-3 flex items-center gap-2">
                                <FiBarChart2 className="text-yellow-50" />
                                Enrollment Statistics
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-richblack-600/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FiUsers className="text-lg text-caribbeangreen-200" />
                                        <span className="text-richblack-300">Total Allocations</span>
                                    </div>
                                    <span className="text-richblack-5 font-semibold">{course.totalEnrolled} students</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-richblack-600/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FiUser className="text-lg text-caribbeangreen-200" />
                                        <span className="text-richblack-300">Enrolled</span>
                                    </div>
                                    <span className="text-caribbeangreen-200 font-semibold">
                                        {course.students.filter(s => s.enrollmentStatus === "Enrolled").length} students
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-richblack-600/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FiClock className="text-lg text-pink-200" />
                                        <span className="text-richblack-300">Not Enrolled</span>
                                    </div>
                                    <span className="text-pink-200 font-semibold">
                                        {course.students.filter(s => s.enrollmentStatus === "Not Enrolled").length} students
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="bg-richblack-700/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-richblack-5 mb-3 flex items-center gap-2">
                            <FiAward className="text-yellow-50" />
                            Enrolled Students
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-richblack-600">
                                        <th className="p-3 text-left text-richblack-300">Name</th>
                                        <th className="p-3 text-left text-richblack-300">PRN</th>
                                        <th className="p-3 text-left text-richblack-300">Roll No</th>
                                        <th className="p-3 text-left text-richblack-300">Department</th>
                                        <th className="p-3 text-left text-richblack-300">Year</th>
                                        <th className="p-3 text-left text-richblack-300">Semester</th>
                                        <th className="p-3 text-left text-richblack-300">Status</th>
                                        <th className="p-3 text-left text-richblack-300">Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {course.students.map((student, index) => (
                                        <tr key={index} className="border-b border-richblack-600/50 hover:bg-richblack-600/30 transition-colors">
                                            <td className="p-3 text-richblack-5">
                                                {student.firstName} {student.lastName}
                                            </td>
                                            <td className="p-3 text-richblack-300">{student.prn}</td>
                                            <td className="p-3 text-richblack-300">{student.rollNumber}</td>
                                            <td className="p-3 text-richblack-300">{student.department}</td>
                                            <td className="p-3 text-richblack-300">{student.year}</td>
                                            <td className="p-3 text-richblack-300">{student.semester}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    student.enrollmentStatus === "Enrolled"
                                                        ? "bg-caribbeangreen-200/20 text-caribbeangreen-200"
                                                        : "bg-pink-200/20 text-pink-200"
                                                }`}>
                                                    {student.enrollmentStatus}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {student.progress ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-2 bg-richblack-600 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-yellow-50 rounded-full"
                                                                style={{ width: `${student.progress.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-richblack-300 text-sm">
                                                            {student.progress.percentage}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-richblack-300">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsModal; 