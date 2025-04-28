import React from 'react'
import { buyCourse } from '../services/operations/studentFeaturesAPI'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import { fetchCourseDetails } from '../services/operations/courseDetailsAPI';
import { useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import RatingStars from '../Components/common/RatingStars';
import GetAvgRating from '../utils/avgRating';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { BsCrosshair, BsGlobe, BsMicrosoftTeams } from 'react-icons/bs';
import { FaShareSquare } from 'react-icons/fa';
import {IoCloseOutline, IoVideocamOutline} from 'react-icons/io5';
import { addToCart } from '../slices/cartSlice';
import { ACCOUNT_TYPE } from '../utils/constants';
import {FaChevronDown} from 'react-icons/fa';
// import { addToWishlist } from '../services/operations/studentFeaturesAPI';

const CourseDetails = () => {
    const {token} = useSelector((state) => state.auth);
    const {user} = useSelector((state) => state.profile);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {courseId} = useParams();
    const [courseDetail, setCourseDetail] = useState(null);
    const [avgReviewCount, setAvgReviewCount] = useState(0);
    const {cart}=useSelector((state)=>state.cart);
    const [showFirstVideo, setShowFirstVideo] = useState(false);

    const handleEnrollNow = () => {
        if(token) {
            navigate("/dashboard/assigned-courses");
        } else {
            navigate('/login');
        }
    }

    const handleGoToCourse = () => {
        if(token) {
            // Get the first section and subsection IDs
            const firstSection = courseDetail?.courseContent?.[0];
            const firstSubSection = firstSection?.subSection?.[0];
            
            if (firstSection && firstSubSection) {
                navigate(`/dashboard/enrolled-courses/view-course/${courseId}/section/${firstSection._id}/sub-section/${firstSubSection._id}`);
            } else {
                navigate("/dashboard/enrolled-courses");
            }
        } else {
            navigate('/login');
        }
    }

    const handleBuyNow = () => {
        if(token) {
            handelAddToCart();
        } else {
            navigate('/login');
        }
    }

    const handleAddToWishlist = () => {
        if(token) {
            // addToWishlist(courseId, token, dispatch);
            toast.success("Course added to wishlist!");
        } else {
            navigate('/login');
        }
    }

    const handelPayment = () => {
        if(token){
            buyCourse(token,[courseId],user,navigate,dispatch);
        }
        else{
            navigate('/login');
        }
    }

    useEffect(() => {
        const getCourseDetails = async() => {
            const response = await fetchCourseDetails(courseId,dispatch);
            // console.log("getCourseDetails -> response", response);
            setCourseDetail(response);
        }
        getCourseDetails();
    }, [courseId]);

    useEffect(() => {
        if(courseDetail?.ratingAndReviews?.length > 0){
            const count = GetAvgRating(courseDetail?.ratingAndReviews);
            setAvgReviewCount(count);
            console.log("getCourseDetails -> count", parseInt(count));
            }
    }, [courseDetail?.ratingAndReviews]);


    //add to cart
    const handelAddToCart = () => {
        if(token){
        dispatch(addToCart(courseDetail));
        // console.log("handelAddToCart -> courseId", courseDetail._id)
        }
        else{
            navigate('/login');
        }
    }

    // Render enrollment button based on status
    const renderEnrollmentButton = () => {
        if (!courseDetail) return null;
        
        const enrollmentStatus = courseDetail.enrollmentStatus;
        
        switch(enrollmentStatus) {
            case "enrolled":
                return (
                    <>
                        <p className="text-richblack-200 mb-2">You are enrolled in this course</p>
                        <button onClick={handleGoToCourse} className='yellowButton'>Go to Course</button>
                    </>
                );
            case "un-enrolled":
                return (
                    <>
                        <p className="text-richblack-200 mb-2">You are allocated this course. Please enroll to access it.</p>
                        <button onClick={handleEnrollNow} className='yellowButton'>Enroll Now</button>
                    </>
                );
            case "not-assigned":
            default:
                return (
                    <>
                        <p className="text-richblack-200 mb-2">Purchase this course to get access</p>
                        <button onClick={handleBuyNow} className='yellowButton'>Buy Now</button>
                    </>
                );
        }
    }

    if(!courseDetail) return <div className='flex justify-center items-center h-screen'>
        <div className='custom-loader'></div>
    </div>

  return (
    <div>
        <div className='mx-auto box-content px-4 lg:w-[1260px] lg:relative '>
            <div className='mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]'>
                <div className='relative block max-h-[30rem] lg:hidden'>
                    <div className='absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]'></div>
                        <img src={courseDetail?.thumbnail} alt="course img" />
                </div>
                    <div className='z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5'>  
                            <p className='text-4xl font-bold text-richblack-5 sm:text-[42px]'>{courseDetail?.courseName}</p>
                            <p className='text-richblack-200'>{courseDetail?.courseDescription}</p>
                            <div className='flex gap-x-3 items-center'>
                        <span className='text-yellow-50'>{courseDetail.avgRating || 0}</span>
                        <RatingStars Review_Count={courseDetail.avgRating} />
                        <span className=' md:block hidden md:text-xl text-richblack-5'>({courseDetail?.totalRatings} Review{courseDetail?.totalRatings>1 ? 's' : ''})</span>
                        {/* student enrolled */}
                        <span className='text-richblack-200'>{courseDetail?.studentsEnrolled} student{courseDetail?.studentsEnrolled > 1 ? 's' : ""} enrolled</span>
                    </div>
                    <div>
                        <p>Created By {courseDetail?.instructor?.firstName}  {courseDetail?.instructor?.lastName}</p>
                    </div>
                    <div className='flex flex-wrap gap-5 text-lg'>
                        <AiOutlineInfoCircle className='text-2xl text-richblack-5' />
                        <p className='text-richblack-50'>Created at &nbsp;    
                        {new Date(courseDetail?.createdAt || courseDetail?.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                        </p>
                        <p className='flex items-center gap-2 text-richblack-50'><BsGlobe className='text-lg text-richblack-50'/>English</p>
                    </div>
                    </div>
                    <div className='flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden'>
                        {ACCOUNT_TYPE.INSTRUCTOR !==user?.accountType &&
                        <>
                            {renderEnrollmentButton()}
                            <button onClick={handleAddToWishlist} className='blackButton text-richblack-5'>Add to Wishlist</button>
                        </>
                        }
                    </div>
                </div>
                <div className='right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute  lg:block'>
                    <div className='flex flex-col gap-4 rounded-md bg-richblack-700 p-4 text-richblack-5'>
                        <img src={courseDetail?.thumbnail} alt="course img" className='max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full' />
                        <div className='px-4'>
                            <div className='flex flex-col gap-4'>
                                {ACCOUNT_TYPE.INSTRUCTOR !==user?.accountType &&
                                <>
                                    {renderEnrollmentButton()}
                                    <button onClick={handleAddToWishlist} className='blackButton text-richblack-5'>Add to Wishlist</button>
                                </>
                                }
                            </div>
                            <div className='pb-3 pt-6 text-center text-sm text-richblack-25'>
                                <p>30-Day Money-Back Guarantee</p>
                            </div>
                            <div className=''>
                                <p className='my-2 text-xl font-semibold '>Pre-requisites</p>
                                <div className='flex flex-col gap-1 text-sm text-caribbeangreen-100'>
                                    {
                                        courseDetail?.instructions?.map((item,index) => (
                                            <div key={index} className='flex gap-2 items-center'>
                                                <span className='text-lg'>✓</span>
                                                <span>{item}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className='text-center'>
                                {/* copy url */}
                                <button className='mx-auto flex items-center gap-2 py-6 text-yellow-100' onClick={
                                    () => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success('URL copied to clipboard');
                                    }
                                }>
                                    <FaShareSquare className='text-xl text-yellow-200'/>
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]'>
                <div className='mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]'>
                    <div className='my-8 border border-richblack-600 p-8'>
                        <p className='text-3xl font-semibold'>
                            What you'll learn
                        </p>
                        <div className='mt-5'>
                        {console.log("What you will learn: ", courseDetail?.whatYouWillLearn)}
                            <ul className="list-disc pl-6">
                                {(courseDetail?.whatYouWillLearn?.split("\n") || []).map((line, ind) =>
                                    line.trim() && (
                                        <li key={ind} className="mb-1">
                                            {line}
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className='max-w-[830px] '>
                        <div className='flex flex-col gap-3'>
                            <p className='text-[28px] font-semibold'>Course Content</p>
                            <div className='flex flex-wrap justify-between gap-2'>
                                <div className='flex gap-2'>
                                    <span>{courseDetail?.courseContent?.length || 0} Section(s)</span>
                                    <span>
                                        {courseDetail?.courseContent?.reduce((acc, item) => 
                                            acc + (item?.subSection?.length || 0), 0
                                        )} Lecture(s)
                                    </span>
                                </div>
                                {/* <button className='text-yellow-25'>
                                    <span>Collapse all sections</span>
                                </button> */}
                            </div>
                        </div>
                        <div className='py-4'>
                            {courseDetail?.courseContent?.map((item, index) => (
                                <details 
                                    key={index} 
                                    className='border border-solid border-richblack-600 bg-richblack-700 text-richblack-5 detailanimatation'
                                >
                                    <summary className='flex cursor-pointer items-start justify-between bg-opacity-20 px-7 py-5 transition-[0.3s]'>
                                        <div className='flex items-center gap-2'>
                                            <FaChevronDown className='arrow' />
                                            <span className='text-xl'>{item?.sectionName}</span>
                                        </div>
                                        <div className='space-x-4'>
                                            <span className='text-yellow-25'>
                                                {item?.subSection?.length || 0} Lecture(s)
                                            </span>
                                        </div>
                                    </summary>
                                    <div className='mt-5'>
                                        {item?.subSection?.map((subItem, subIndex) => (
                                            <div 
                                                key={subIndex} 
                                                className='relative overflow-hidden bg-richblack-900 p-5 border border-solid border-richblack-600 flex items-center justify-between cursor-pointer'
                                                onClick={() => {
                                                    if (index === 0 && subIndex === 0 && courseDetail?.firstVideoUrl) {
                                                        setShowFirstVideo(true);
                                                    }
                                                }}
                                            >
                                                <div className='flex items-center gap-2'>
                                                    <IoVideocamOutline className='txt-lg text-richblack-5' />
                                                    <span className='text-lg'>{subItem?.title}</span>
                                                </div>
                                                <span className='text-sm text-richblack-200'>
                                                    {subItem?.timeDuration 
                                                    ? 
                                                        Math.floor(subItem.timeDuration / (60*60)) > 0
                                                    ? 
                                                        `${Math.floor(subItem.timeDuration / (60*60))} :`
                                                    :
                                                        `${Math.floor(subItem.timeDuration / 60)}:${('0' + (subItem.timeDuration % 60).toFixed(0)).slice(-2)}` 
                                                    : 
                                                        ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='mb-12 py-4'>
                </div>
                <p className='text-[28px] font-semibold'>
                    Author
                </p>
                <div className='flex items-center gap-4 py-4'>
                    <img src={courseDetail?.instructor.image} alt="author img" className='w-[50px] h-[50px] rounded-full object-cover'/>
                    <p className='text-xl font-semibold'>{courseDetail?.instructor?.firstName} {courseDetail?.instructor?.lastName}</p>
                </div>
                <p className='text-richblack-50 text-sm mb-10'>{courseDetail?.instructor?.additionalDetails?.about}</p>
            </div>

            {/* Reviews */}
            <div className='mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]'>
                <div className='mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]'>
                    <div className='my-8 border border-richblack-600 p-8'>
                        <p className='text-3xl font-semibold'>
                            Reviews
                        </p>
                        <div className='mt-5'>
                            {
                                courseDetail?.ratingAndReviews?.length > 0 ? (
                                    <div className='flex flex-col gap-4'>
                                        {
                                            courseDetail?.ratingAndReviews?.map((review, index) => (
                                                <div key={index} className='flex flex-col gap-2'>
                                                    <div className='flex items-center gap-2'>
                                                        <img src={review?.user?.image} alt="user img" className='w-[30px] h-[30px] rounded-full object-cover'/>
                                                        <p className='text-xl font-semibold'>{review?.user?.firstName} {review?.user?.lastName}</p>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <RatingStars Review_Count={review?.rating} />
                                                        <p className='text-richblack-200'>{review?.review}</p>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                ) : (
                                    <p className='text-richblack-200'>No reviews yet</p>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        {/* Show iframe for first video if clicked */}
        {showFirstVideo && courseDetail?.firstVideoUrl && (
            <div className="m-auto w-full flex full overflow-y-auto fixed inset-0 z-50 justify-center items-center bg-richblack-900 bg-opacity-30 backdrop-blur-md ">
                <div className='text-red-500 p-1 rounded-full bg-richblack-700 absolute top-6 right-6 scale-[2] cursor-pointer'
                    onClick={()=>setShowFirstVideo(false)}
                >
                    <IoCloseOutline/>
                </div>
                <iframe
                    src={courseDetail?.firstVideoUrl}
                    title="First Video"
                    // width="640"
                    // height="360"
                    width="1280"
                    height="720"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg border border-richblack-600"
                ></iframe>
            </div>
        )}
    </div>
  )
}

export default CourseDetails