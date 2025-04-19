import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {getUserCourses as getUserEnrolledCourses}  from '../../../services/operations/profileAPI';
import ProgressBar from '@ramonak/react-progress-bar';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
// import { ACCOUNT_TYPE } from '../../utils/constants'
import { IoVideocamOutline } from 'react-icons/io5'

const EnrolledCourses = () => {
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const [Loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Demo enrolled courses data
    const enrolledCourses = [
        {
            _id: "1",
            courseName: "Introduction to Web Development",
            courseDescription: "Learn the fundamentals of web development including HTML, CSS, and JavaScript",
            thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
            instructor: {
                firstName: "John",
                lastName: "Doe"
            },
            progress: 75,
            totalLectures: 20,
            completedLectures: 15,
            lastAccessed: "2 days ago"
        },
        {
            _id: "2",
            courseName: "Data Structures and Algorithms",
            courseDescription: "Master the fundamentals of data structures and algorithms for coding interviews",
            thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            instructor: {
                firstName: "Jane",
                lastName: "Smith"
            },
            progress: 30,
            totalLectures: 30,
            completedLectures: 9,
            lastAccessed: "5 days ago"
        },
        {
            _id: "3",
            courseName: "React.js Masterclass",
            courseDescription: "Build modern web applications with React.js and its ecosystem",
            thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            instructor: {
                firstName: "Mike",
                lastName: "Johnson"
            },
            progress: 10,
            totalLectures: 25,
            completedLectures: 2,
            lastAccessed: "1 week ago"
        }
    ]

    if(Loading) {
        return (
            <div className='flex h-[calc(100vh)] w-full justify-center items-center'>
                <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-richblack-500'></div>
            </div>
        )
    }

  return (
        <div className="text-richblack-5">
            <div className="mb-14 flex items-center justify-between">
                <h1 className="text-3xl font-medium text-richblack-5">Enrolled Courses</h1>
            </div>
            <div className="mx-auto max-w-[1200px] px-4">
                <div className="flex flex-col gap-6">
                    {enrolledCourses.map((course) => (
                        <div 
                            key={course._id} 
                            className="flex flex-col gap-6 rounded-xl bg-richblack-800 p-6 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] md:flex-row"
                        >
                            <img
                                src={course.thumbnail}
                                alt={course.courseName}
                                className="h-[200px] w-full rounded-lg object-cover md:w-[300px]"
                            />
                            <div className="flex flex-1 flex-col gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold">{course.courseName}</h2>
                                    <p className="text-sm text-richblack-300">{course.courseDescription}</p>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-richblack-300">Course Progress</span>
                                        <span className="text-sm font-medium text-yellow-50">{course.progress}%</span>
                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-richblack-700">
                                        <div 
                                            className="h-full rounded-full bg-yellow-50 transition-all duration-500"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-richblack-300">
                                    <div className="flex items-center gap-2">
                                        <IoVideocamOutline className="text-lg" />
                                        <span>{course.completedLectures}/{course.totalLectures} Lectures</span>
                                    </div>
                                    <span>|</span>
                                    <div>
                                        <span>Last accessed: {course.lastAccessed}</span>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <button
                                        onClick={() => navigate(`/dashboard/enrolled-courses/${course._id}`)}
                                        className="rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 transition-all duration-200 hover:bg-yellow-100"
                                    >
                                        Continue Learning
                                    </button>
                                    </div> 
                            </div>
                        </div>
                    ))}
                </div>
            </div>
    </div>
  )
}

export default EnrolledCourses
