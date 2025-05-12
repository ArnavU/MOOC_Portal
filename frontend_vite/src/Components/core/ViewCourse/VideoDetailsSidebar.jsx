import React from 'react'
import { useState } from 'react'; 
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import IconBtn from '../../common/IconBtn'
import {FaChevronLeft} from 'react-icons/fa'
import {MdOutlineKeyboardArrowDown, MdQuiz} from 'react-icons/md'
import {FaAngleDoubleRight} from 'react-icons/fa'
import AttachmentListSidebar from './AttachmentListSidebar';
import { getQuizDetails, getSubsectionIdsWithQuizzes } from '../../../services/operations/quizAPI';
import { setOpenQuizModal, setQuizDetails, setSelectedQuizSubSectionId, setSubSectionIdsWithQuizzes } from '../../../slices/quizSlice';

const VideoDetailsSidebar = ({setReviewModal}) => {
  const [activeStatus, setActiveStatus] = useState("");
  const [videoActive, setVideoActive] = useState("");
  const {courseId,sectionId,subsectionId} = useParams();
  // console.log("sectionId", sectionId, "SubSectionId", subsectionId);
  const {courseSectionData, courseEntireData, completedLectures, totalNoOfLectures} = useSelector(state => state.viewCourse);
  const {selectedQuizSubSectionId, subSectionIdsWithQuizzes, submittedQuizzesDetails} = useSelector(state => state.quizDetails);
  const {accountType} = useSelector(state => state.profile.user);
  // console.log(courseSectionData);
  const navigate = useNavigate();
  const[showSidebar, setShowSidebar] = useState(false);
  // const [subSectionIdsWithQuizzes, setSubSectionIdsWithQuizzes] = useState([]);
  const [quizzesDetails, setQuizzesDetails] = useState(null);

  const dispatch = useDispatch();

  const fetchQuizDetails = async(subSectionId) => {
    const quizDetails = await getQuizDetails(subSectionId);
    console.log("Quiz Details", quizDetails);
    if(quizDetails?.questions.length > 0){
      // console.log("Quiz Details", quizDetails);{
      return quizDetails;
    }
    return null;
  }

  useEffect(() => {
    const fetchSubsectionIdsWithQuizzes = async() => {
      const subSectionIds = await getSubsectionIdsWithQuizzes(courseId);
      dispatch(setSubSectionIdsWithQuizzes(subSectionIds));
      
      const quizDetailsPromises = subSectionIds?.map((subSectionId) => fetchQuizDetails(subSectionId));
      const quizDetailsArray = await Promise?.all(quizDetailsPromises);
      quizDetailsArray?.forEach((details, index) => {
        if (details) {
          setQuizzesDetails((prev) => ({
            ...prev,
            [subSectionIds[index]]: details,
          }));
        }
      });

      // const quizDetails = await fetchQuizDetails(subSectionIds)
    }
    if(courseId){
      fetchSubsectionIdsWithQuizzes();
    }
  }, [courseId])

  useEffect(() => {
    ;(() => {
      if(!courseSectionData) return;
      const currentSectionIndex = courseSectionData.findIndex((section) => section._id === sectionId);
      // console.log("currentSectionIndex", currentSectionIndex);
      const currentSubSectionIndex = courseSectionData[currentSectionIndex]?.subSection.findIndex((subSection) => subSection?._id === subsectionId);
      // console.log("currentSubSectionIndex", currentSubSectionIndex);
      if(currentSectionIndex === -1 || currentSubSectionIndex === -1) return;
      const activesubsectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex]._id;
      setActiveStatus(courseSectionData[currentSectionIndex]._id);
      setVideoActive(activesubsectionId);
      // console.log("activeSubsectionId", activesubsectionId);
      // console.log("activeSectionId", courseSectionData[currentSectionIndex]._id);
    })();
  }, [courseSectionData, sectionId, subsectionId]);

  return (
    <>
      <div className={`${showSidebar?"":"hidden"} w-6 h-72 md:hidden relative `}>
        <FaAngleDoubleRight onClick={()=>{setShowSidebar(!showSidebar);}} className={` md:hidden z-10 cursor-pointer text-2xl text-richblack-900 m-2 bg-richblack-100 rounded-full p-1 top-3 absolute -left-1 `} />
      </div>
      <div className={ `${showSidebar?"h-0 w-0":"h-[calc(100vh-3.5rem)] w-[320px]"} transition-all duration-700 z-20 relative offSidebar1`}>
        <div className={`${showSidebar?"hidden":""} transition-all origin-right duration-500 flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800 offSidebar2`}>
          <div className={`${showSidebar?"hidden":""} mx-5   flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25 offSidebar2`}>
            <div className='flex w-full items-center justify-between '>
              <div className='relative flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90'>
                <FaChevronLeft className=' cursor-pointer md:hidden' onClick={()=>{setShowSidebar(true)}}/>
                <div className='absolute rounded-full h-full w-full flex items-center justify-center cursor-pointer'
                  onClick={()=>{
                      if(accountType === "Student"){
                        navigate(`/dashboard/enrolled-courses`);
                      } else if(accountType === "Instructor"){
                        navigate(`/dashboard/my-courses`);
                      } else if(accountType === "hod") {
                        navigate(`/dashboard/hod/course-approvals`);
                      }
                  }}
                >
                  <FaChevronLeft className='hidden md:block' />
                </div>
              </div>
              <IconBtn text={"Review"} onclick={()=>{setReviewModal(true)}}/>
            </div>
            <div className='flex flex-col'>
              <p>My Courses</p>
              <p className='text-sm font-semibold text-richblack-500'>
                {completedLectures?.length} of {totalNoOfLectures} Lectures Completed
              </p>
            </div>
          </div>
          <div className='h-[calc(100vh - 5rem)] overflow-y-auto px-2'>
            {
              courseSectionData?.map((section, index) => (
                <details key={index} className=' appearance-none text-richblack-5 detailanimatation'>
                  <summary className='mt-2 cursor-pointer text-sm text-richblack-5 appearance-none'>
                    <div className='flex flex-row justify-between bg-richblack-600 px-5 py-4'>
                      <p className='w-[70%] font-semibold'>{section?.sectionName}</p>
                      <div className='flex items-center gap-3'>
                        <MdOutlineKeyboardArrowDown className='arrow'/>
                      </div>
                    </div>
                  </summary>
                  {
                    section?.subSection.map((subSection, index) => (
                      <div  key={subSection?._id} className='transition-[height] duration-500 ease-in-out'>
                        <div onClick={() =>{
                          setShowSidebar(true);
                          navigate(`/dashboard/enrolled-courses/view-course/${courseId}/section/${section?._id}/sub-section/${subSection?._id}`);
                        }} className={`${subSection?._id === videoActive? ("bg-yellow-200"): ("bg-richblack-50") } cursor-pointer items-baseline  flex gap-3  px-5 py-2 font-semibold text-richblack-800 relative border-b-[1px] border-richblack-600 `}>
                        {/* <input type='checkbox' className=' '/> */}
                          <div className="checkbox-wrapper-19 absolute bottom-1">
                            <input readOnly={true} checked={
                              completedLectures?.includes(subSection?._id)
                            }  type="checkbox" />
                            <label className="check-box"></label>
                          </div>
                          <p className=' ml-6'>{subSection?.title}</p>
                        </div>

                        {/* Quiz for this subsection */}
                        {subSectionIdsWithQuizzes.includes(subSection?._id) && (
                          <div
                            onClick={() => {
                              dispatch(setQuizDetails(quizzesDetails?.[subSection._id]));
                              dispatch(setOpenQuizModal(true));
                              dispatch(setSelectedQuizSubSectionId(subSection._id));
                            }}
                            className={`group mb-3 flex w-full items-center justify-between border px-4 py-1 shadow-sm transition hover:scale-[1.02] hover:border-yellow-400 hover:bg-yellow-100 hover:shadow-md cursor-pointer
                              ${selectedQuizSubSectionId === subSection._id ? "bg-yellow-200" : "bg-richblack-100"}
                            `}
                          >
                            {/* Left side icon and text */}
                            <div className="flex items-center gap-3">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-yellow-900 font-bold text-sm shadow-inner">
                                <MdQuiz className="text-xl text-yellow-800" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-yellow-900 group-hover:text-yellow-950">
                                  Quiz Available
                                </p>
                                <p className="text-xs text-yellow-700 group-hover:text-yellow-800">
                                  {quizzesDetails?.[subSection._id]?.title}
                                </p>
                              </div>
                            </div>

                            {/* Right side - Submission status and score */}
                            {(() => {
                              console.log("submittedQuizzesDetails", submittedQuizzesDetails);
                              if (submittedQuizzesDetails.hasOwnProperty(subSection._id)) {
                                return (
                                  <div className="text-right flex flex-row gap-2 items-center text-xs font-semibold text-green-600">
                                    <p>{submittedQuizzesDetails[subSection._id].scoredPoints} / {submittedQuizzesDetails[subSection._id].totalPoints}</p>
                                    <div className="checkbox-wrapper-19 mt-1">
                                      <input readOnly={true} checked={
                                        completedLectures?.includes(subSection?._id)
                                      }  type="checkbox" />
                                      <label className="check-box"></label>
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="text-right text-xs font-semibold text-red-500">
                                    <p>Not Attempted ❌</p>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        )}



                      </div>
                    ))
                  }
                  {/* Attachments for this section */}
                  <AttachmentListSidebar attachments={section.attachments} />
                  </details>
              ))
            }
          </div>
        </div>     
      </div>
    <div onClick={()=>{setShowSidebar(true)}} className={`${showSidebar?"hidden":""} fixed top-0 left-0 w-full h-full bg-richblack-900 bg-opacity-50 z-10 offSidebar3`}></div>
    </>
  )
}

export default VideoDetailsSidebar