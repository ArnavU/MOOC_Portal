import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
// import { enrollCourse } from '../../../services/operations/studentFeaturesAPI'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { FiPlus } from 'react-icons/fi'
import CourseAssignmentWizard from './CourseAssignmentWizard'
import CourseAllocations from './CourseAllocations'

const CourseAssignments = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.auth)
    const { user } = useSelector((state) => state.profile)
    const [showWizard, setShowWizard] = useState(false)

    // Demo assigned courses data
    const assignedCourses = [
        {
            _id: "1",
            courseName: "Introduction to Web Development",
            courseDescription: "Learn the fundamentals of web development including HTML, CSS, and JavaScript",
            thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
            instructor: {
                firstName: "John",
                lastName: "Doe"
            },
            duration: "4 weeks",
            studentsEnrolled: 150
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
            duration: "6 weeks",
            studentsEnrolled: 200
        }
    ]

    const handleEnroll = async (courseId) => {
        if (token) {
            try {
                // await enrollCourse(token, [courseId], user, navigate, dispatch)
                toast.success("Successfully enrolled in the course!")
            } catch (error) {
                toast.error("Failed to enroll in the course")
            }
        } else {
            navigate("/login")
        }
    }

    const handleBack = () => {
        setShowWizard(false)
    }

    return (
        <div className="text-richblack-5 min-w-[85%]">
            <div className="mb-14 flex items-center justify-between">
                <h1 className="text-3xl font-medium text-richblack-5">
                    {showWizard ? "Assign Courses to Students" : "Course Allocations"}
                </h1>
                {!showWizard && (
                    <button
                        onClick={() => setShowWizard(true)}
                        className="flex items-center gap-2 rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 transition-all duration-200 hover:bg-yellow-100"
                    >
                        <FiPlus className="text-lg" />
                        Assign Courses
                    </button>
                )}
            </div>

            {showWizard ? (
                <CourseAssignmentWizard onBack={handleBack} />
            ) : (
                <CourseAllocations />
            )}
        </div>
    )
}

export default CourseAssignments 