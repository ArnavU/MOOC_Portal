import React, { useState, useEffect } from 'react';
import { FiBook, FiUser, FiCalendar, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import { fetchCourseAllocations } from '../../../../services/operations/InstructorAPI';
import CourseDetailsModal from './CourseDetailsModal';

const CourseAllocations = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchAllocations = async () => {
            try {
                setLoading(true);
                const data = await fetchCourseAllocations();
                console.log("Course Allocations data:", data);
                setAllocations(data);
            } catch (error) {
                console.error("Error fetching allocations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllocations();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleViewDetails = (course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh)] w-full justify-center items-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-richblack-500"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full py-10">
            {allocations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
                    <div className="bg-richblack-800 p-8 rounded-xl max-w-md w-full">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-richblack-700 rounded-full">
                                <FiBook className="text-4xl text-richblack-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-richblack-5">No Course Allocations</h2>
                            <p className="text-richblack-300">
                                No students have been allocated to your courses yet. Use the "Assign Course" button to allocate courses to students.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allocations.map((allocation) => (
                        <div 
                            key={allocation.courseId} 
                            className="group relative bg-richblack-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-richblack-500/20 hover:-translate-y-1"
                        >
                            {/* Status Badges */}
                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    allocation.status === "Published" 
                                        ? 'bg-green-500/20 text-green-500' 
                                        : 'bg-red-500/20 text-red-500'
                                }`}>
                                    {allocation.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    allocation.approved 
                                        ? 'bg-yellow-50/20 text-yellow-50' 
                                        : 'bg-red-500/20 text-red-500'
                                }`}>
                                    {allocation.approved ? "Approved" : "Not Approved"}
                                </span>
                            </div>

                            {/* Course Thumbnail */}
                            <div className="relative h-40 overflow-hidden">
                                {allocation.thumbnail ? (
                                    <img 
                                        src={allocation.thumbnail} 
                                        alt={allocation.courseName}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-richblack-700 flex items-center justify-center">
                                        <FiBook className="text-richblack-300 text-4xl" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-richblack-800 to-transparent opacity-80" />
                            </div>

                            {/* Course Content */}
                            <div className="p-4">
                                {/* Course Title and Code */}
                                <div className="mb-3">
                                    <h3 className="text-lg font-semibold text-richblack-5 mb-1 group-hover:text-yellow-50 transition-colors">
                                        {allocation.courseName}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-richblack-300 flex items-center gap-1">
                                            <FiBook className="text-yellow-50" />
                                            {allocation.courseCode}
                                        </p>
                                        <span className="text-sm text-richblack-300">
                                            {allocation.category?.name || "No Category"}
                                        </span>
                                    </div>
                                </div>

                                {/* Course Stats */}
                                <div className="space-y-2 mb-4">
                                    {/* Total Students */}
                                    <div className="bg-richblack-700/50 rounded-lg p-2 group">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-caribbeangreen-200/10 rounded-lg group-hover:bg-caribbeangreen-200/20 transition-colors">
                                                <FiUser className="text-lg text-caribbeangreen-200" />
                                            </div>
                                            <div>
                                                <p className="text-richblack-300 text-xs">Total Students</p>
                                                <p className="text-richblack-5 font-semibold text-sm">
                                                    {allocation.totalEnrolled}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Created On */}
                                    <div className="bg-richblack-700/50 rounded-lg p-2 group">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-yellow-50/10 rounded-lg group-hover:bg-yellow-50/20 transition-colors">
                                                <FiCalendar className="text-lg text-yellow-50" />
                                            </div>
                                            <div>
                                                <p className="text-richblack-300 text-xs">Created On</p>
                                                <p className="text-richblack-5 font-semibold text-sm">
                                                    {formatDate(allocation.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleViewDetails(allocation)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-richblack-700 text-richblack-5 hover:bg-richblack-600 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-50/10 text-sm"
                                >
                                    <FiEye className="text-base group-hover:scale-110 transition-transform" />
                                    View Course Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && selectedCourse && (
                <CourseDetailsModal
                    course={selectedCourse}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default CourseAllocations; 