import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getEnrolledCourses } from '../../../../services/operations/studentAPI';
import ProgressBar from '@ramonak/react-progress-bar';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
// import { ACCOUNT_TYPE } from '../../utils/constants'
import { IoVideocamOutline } from 'react-icons/io5'
import { FiUser } from 'react-icons/fi'
import { formatLastAccessed } from "../../../../utils/formatLastAccessed"
import { downloadCertificate, getCertificate } from '../../../../services/operations/certificateAPI';
import { FaEye, FaTimes, FaDownload } from "react-icons/fa";

const EnrolledCourses = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [enrolledData, setEnrolledData] = useState({
        activeCourses: 0,
        totalCourses: 0,
        expiredCourses: 0,
        courses: []
    });

    const downloadCerfificateHandler = async (courseId) => {
        try {
            await downloadCertificate(courseId);
        } catch (error) {
            console.error("Error downloading certificate:", error);
        }
    }

    const handlePreview = async (courseId) => {
        const url = await getCertificate(courseId);
        setPdfUrl(url);
    };

    const handleClose = () => {
        setPdfUrl(null);
    };

    
      useEffect(() => {
        return () => {
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
          }
        };
      }, [pdfUrl]);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            setLoading(true);
            try {
                const response = await getEnrolledCourses();
                if (response) {
                    setEnrolledData(response);
                }
            } catch (error) {
                console.error("Error fetching enrolled courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrolledCourses();
    }, []);

    if (loading) {
        return (
            <div className='flex h-[calc(100vh)] w-full justify-center items-center'>
                <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-richblack-500'></div>
            </div>
        )
    }

    return (
        <div className="text-richblack-5 w-[80%] px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-medium text-richblack-5">Enrolled Courses</h1>
            </div>
            <div className="mx-auto max-w-full">
                <div className="flex flex-col gap-8">
                    {enrolledData.courses.length === 0 ? (
                        <p className="text-center text-lg text-richblack-300">
                            You haven't enrolled in any courses yet.
                        </p>
                    ) : (
                        enrolledData.courses.map((course) => (
                            <div 
                                key={course.courseId} 
                                className="flex flex-col gap-6 rounded-xl bg-richblack-800 p-6 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] md:flex-row relative"
                            >
                                {/* Instructor Information in Top Right Corner */}
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="relative group">
                                        <div className="flex items-center gap-2 text-sm text-richblack-300 bg-richblack-700 px-3 py-1 rounded-full">
                                            <FiUser className="text-lg" />
                                            <span className="cursor-pointer hover:text-yellow-50 transition-colors">
                                                {course.instructor?.name || 'Unknown Instructor'}
                                            </span>
                                        </div>
                                        {/* Instructor Popup Card */}
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-richblack-900 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                                            <div className="p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <img 
                                                        src={course.instructor?.image} 
                                                        alt={course.instructor?.name}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <h3 className="text-yellow-50 font-medium">{course.instructor?.name}</h3>
                                                        <p className="text-xs text-richblack-300">{course.instructor?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-richblack-300 space-y-1">
                                                    <p>Department: {course.instructor?.department?.name || 'Not Assigned'}</p>
                                                    <p>Course Code: {course.courseCode}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:w-[300px] h-[200px] flex-shrink-0">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.courseName}
                                        className="h-full w-full rounded-lg object-contain bg-richblack-700"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">{course.courseName}</h2>
                                        <p className="text-sm text-richblack-300">{course.courseDescription}</p>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-richblack-300">Course Progress</span>
                                            <span className="text-sm font-medium text-yellow-50">
                                                {course.progress?.percentage.toFixed(2) || 0}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-richblack-700">
                                            <div 
                                                className="h-full rounded-full bg-yellow-50 transition-all duration-500"
                                                style={{ width: `${course.progress?.percentage || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-richblack-300">
                                        <div className="flex items-center gap-2">
                                            <IoVideocamOutline className="text-lg" />
                                            <span>
                                                {course.progress?.completedVideos || 0}/{course.progress?.totalVideos || 0} Lectures
                                            </span>
                                        </div>
                                        <span>|</span>
                                        <div>
                                            <span>
                                                Last accessed: {formatLastAccessed(course.lastAccessed)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex flex-row items-center justify-between">
                                        <button
                                            onClick={() => navigate(`/courses/${course.courseId}`)}
                                            className="rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 transition-all duration-200 hover:bg-yellow-100"
                                        >
                                            Continue Learning
                                        </button>
                                        {course.progress?.percentage == 100 && 
                                            <div className='flex gap-4'>
                                                <button
                                                    onClick={() => handlePreview(course.courseId)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                    View Certificate
                                                </button>
                                                <button
                                                  onClick={() => downloadCerfificateHandler(course.courseId)}
                                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition duration-200"
                                                >
                                                  <FaDownload className="w-4 h-4" />
                                                  Download Certificate
                                                </button>
                                            </div>
                                        }   
                                    </div> 
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {pdfUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                  <div className="relative w-11/12 md:w-3/4 h-5/6 bg-white rounded-lg shadow-lg ">
                    <button
                      onClick={handleClose}
                      className="absolute z-50 top-0 left-full -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-richblack-300 text-gray-600 hover:text-black text-xl "
                      title="Close"
                    >
                      <FaTimes />
                    </button>
                    <iframe
                      src={pdfUrl}
                      title="Certificate Preview"
                      className="w-full h-full border-none"
                    ></iframe>
                  </div>
                </div>
            )}
        </div>
    )
}

export default EnrolledCourses
 