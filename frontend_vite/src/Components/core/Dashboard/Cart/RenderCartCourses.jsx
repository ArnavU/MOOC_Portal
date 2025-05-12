import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RiDeleteBin6Line } from "react-icons/ri";
import { removeFromCart } from '../../../../slices/cartSlice';
import ReactStars from "react-rating-stars-component";
import { Link } from 'react-router-dom';

const RenderCartCourses = () => {
    const { cart } = useSelector((state) => state.cart);
    const dispatch = useDispatch();

    // Debug logging
    useEffect(() => {
        console.log("Cart items in RenderCartCourses:", cart);
    }, [cart]);

    // Handle empty or undefined cart
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return (
            <div className="flex-1 rounded-md bg-richblack-800 p-6 flex justify-center items-center">
                <p className="text-richblack-100">No courses in your cart</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            {cart.map((course, index) => (
                <div 
                    key={course?._id || index} 
                    className="flex w-full flex-wrap items-start justify-between gap-6 border-b border-b-richblack-400 py-6"
                >
                    <div className="flex flex-1 flex-col gap-4 xl:flex-row">
                        {/* Course Thumbnail */}
                        <Link to={`/courses/${course?._id}`}>
                            <img 
                                className="h-[100px] w-[180px] md:h-[148px] md:w-[220px] rounded-lg object-cover" 
                                src={course?.thumbnail || '/placeholder-course.jpg'} 
                                alt={course?.courseName || "Course"} 
                            />
                        </Link>
                        
                        {/* Course Details */}
                        <div className="flex flex-col space-y-1">
                            <Link to={`/courses/${course?._id}`}>
                                <p className="text-lg font-semibold text-richblack-5 poppins">
                                    {course?.courseName || "Untitled Course"}
                                </p>
                            </Link>
                            
                            {course?.category?.name && (
                                <Link to={`/catalog/${course.category.name}`}>
                                    <p className="text-sm text-richblack-300">{course.category.name}</p>
                                </Link>
                            )}
                            
                            {/* Ratings */}
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-50">
                                    {course?.ratingAndReviews?.length || 0} Ratings
                                </span>
                                <ReactStars
                                    count={5}
                                    value={course?.averageRating || 0}
                                    size={20}
                                    edit={false}
                                    activeColor="#ffd700"
                                />
                            </div>
                            
                            {/* Instructor */}
                            {course?.instructor && (
                                <p className="text-sm text-richblack-300">
                                    Instructor: {course.instructor?.name || "Unknown"}
                                </p>
                            )}
                            
                            {/* Price */}
                            <p className="text-lg font-semibold text-yellow-50">
                                ₹{course?.price || 0}
                            </p>
                        </div>
                    </div>

                    {/* Remove Button */}
                    <div className="flex flex-col items-end space-y-2">
                        <button 
                            className="flex items-center gap-x-1 rounded-md border border-richblack-600 bg-richblack-700 py-2 px-3 text-pink-200 text-lg font-medium"
                            onClick={() => dispatch(removeFromCart(course?._id))}
                        >
                            <RiDeleteBin6Line />
                            <span>Remove</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RenderCartCourses;