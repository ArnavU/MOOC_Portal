import { useDispatch, useSelector } from "react-redux"
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"

import { setCourse, setEditCourse } from "../../../../slices/courseSlice"
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css"
import { useState } from "react"
import { FaCheck, FaEye } from "react-icons/fa"
import { FiEdit2 } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"

import { formatDate } from "../../../../services/formatDate"
import {
  deleteCourse,
  fetchInstructorCourses,
  getFirstSectionSubSectionIds,
} from "../../../../services/operations/courseDetailsAPI"
import { COURSE_STATUS } from "../../../../utils/constants"
import ConfirmationModal from "../../../common/ConfirmationModal"

export default function CoursesTable({ courses, setCourses }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const TRUNCATE_LENGTH = 30

  const handleCourseDelete = async (courseId) => {
    setLoading(true)
    await deleteCourse({ courseId: courseId }, token)
    const result = await fetchInstructorCourses(token)
    if (result) {
      setCourses(result)
    }
    setConfirmationModal(null)
    setLoading(false)
  }

  const handleViewCourse = async(courseId) => {
    const [section, subSection] = await getFirstSectionSubSectionIds(courseId);
    if(section && subSection) {
      navigate(`/dashboard/enrolled-courses/view-course/${courseId}/section/${section}/sub-section/${subSection}`);
    }
  }

  // console.log("All Course ", courses)

  if(loading) {
    return (
        <div className="custom-loader"></div>
    )
    }


  return (
    <>
      <Table className="rounded-xl border border-richblack-800 ">
        <Thead >
          <Tr className="flex gap-x-10 rounded-t-md border-b border-b-richblack-800 px-6 py-2 text-richblack-100">
            <Th className="flex-1 text-left text-sm font-medium uppercase text-richblack-100">
              Courses
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Duration
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {courses?.length === 0 ? (
            <Tr>
              <Td className="py-10 text-center text-2xl font-medium text-richblack-100">
                No courses found
                {/* TODO: Need to change this state */}
              </Td>
            </Tr>
          ) : (
            courses?.map((course) => (
              <Tr
                key={course?._id}
                className="flex gap-x-10 border-b border-richblack-800 px-6 py-8 gap-4"
              >
                <Td colSpan={1}  className="flex flex-1 gap-x-4 p-3">
                  <img
                    src={course?.thumbnail}
                    alt={course?.courseName}
                    className="md:h-[148px] md:w-[220px] aspect-video rounded-lg object-contain"
                  />
                  <div className="flex flex-col gap-1 justify-between">
                    <div>
                      <div className="flex flex-row items-center gap-2">
                        <p className="text-lg font-semibold text-richblack-5">
                          {course.courseName}
                        </p>
                        {course.category && (
                          <span className="px-2 py-1 text-xs font-medium text-yellow-50 bg-yellow-900/20 rounded-full border border-yellow-500/20">
                            {course.category.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-richblack-300">
                        {course?.courseDescription.split(" ")?.length >
                        TRUNCATE_LENGTH
                          ? course.courseDescription
                              .split(" ")
                              .slice(0, TRUNCATE_LENGTH)
                              .join(" ") + "..."
                          : course.courseDescription}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-[12px] text-white">
                        Created: {formatDate(course?.createdAt || course?.updatedAt)}
                      </p>
                      <div className="flex flex-row gap-2">
                        {course.status === COURSE_STATUS.DRAFT ? (
                          <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-pink-100">
                            <HiClock size={14} />
                            Drafted
                          </p>
                        ) : (
                          <>
                            <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-yellow-100">
                              <div className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-100 text-richblack-700">
                                <FaCheck size={8} />
                              </div>
                              Published
                            </p>
                            {course.approved ? (
                              <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-caribbeangreen-700 px-2 py-[2px] text-[12px] font-medium text-caribbeangreen-100">
                                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-caribbeangreen-100 text-caribbeangreen-700">
                                  <FaCheck size={8} />
                                </div>
                                Approved
                              </p>
                            ) : (
                              <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-pink-700 px-2 py-[2px] text-[12px] font-medium text-pink-100">
                                <HiClock size={14} />
                                Not Approved Yet
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {handleViewCourse(course._id)}}
                      className="w-fit flex flex-row items-center gap-2 rounded-md bg-yellow-50 px-3 py-1 text-sm font-medium text-richblack-900 transition-all duration-200 hover:bg-yellow-100"
                    >
                      <div><FaEye size={14} /></div>
                      <span>View Course</span>
                    </button>
                  </div>
                </Td>
                <Td className="text-sm font-medium text-richblack-100">
                  {course.duration}
                </Td>
                <Td className="text-sm font-medium text-richblack-100 ">
                  <button
                    disabled={loading}
                    onClick={() => {
                      navigate(`/dashboard/edit-course/${course._id}`);
                    }}
                    title="Edit"
                    className="px-2 transition-all duration-200 hover:scale-110 hover:text-caribbeangreen-300 mr- mb-"
                  >
                    <FiEdit2 size={20} />
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => {
                      setConfirmationModal({
                        text1: "Do you want to delete this course?",
                        text2:
                          "All the data related to this course will be deleted",
                        btn1Text: !loading ? "Delete" : "Loading...  ",
                        btn2Text: "Cancel",
                        btn1Handler: !loading
                          ? () => handleCourseDelete(course._id)
                          : () => {},
                        btn2Handler: !loading
                          ? () => setConfirmationModal(null)
                          : () => {},
                      })
                    }}
                    title="Delete"
                    className="px-1 transition-all duration-200 hover:scale-110 hover:text-[#ff0000]"
                  >
                    <RiDeleteBin6Line size={20} />
                  </button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}