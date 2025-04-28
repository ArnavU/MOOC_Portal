import React, { useEffect, useState } from 'react'
import RatingStars from '../../common/RatingStars'
import GetAvgRating from '../../../utils/avgRating';
import { Link } from 'react-router-dom';

const Course_Card = ({course, Height}) => {

    const [avgReviewCount, setAvgReviewCount] = useState(0);

    useEffect(()=> {
        const count = GetAvgRating(course.ratingAndReviews);
        setAvgReviewCount(count);
    },[course])


    
  return (
    <div className=' mb-4 hover:scale-[1.03] transition-all duration-200 z-50 '>
        <Link to={`/courses/${course._id}`}>
            <div>
                <div>
                    <img 
                        src={course?.thumbnail}
                        alt='course thumbnail'
                        className={`${Height}  rounded-xl object-cover`}
                    />
                </div>
                <div className='flex flex-col gap-2 px-4 py-3'>
                    <p className='text-xl text-richblack-5'>{course?.courseName}</p>
                    <p className='text-sm text-richblack-300'>{course?.courseDescription}</p>
                    <div className='flex items-center gap-2'>
                        <span className='text-yellow-50'>{course?.avgRating || 0}</span>
                        <RatingStars Review_Count={course?.avgRating || 0} />
                        <span className='text-richblack-400'>{course?.totalRatings} Rating{course?.totalRatngs > 0 ? "s" : ""}</span>
                    </div>
                </div>
            </div>
        </Link>

      
    </div>
  )
}

export default Course_Card
