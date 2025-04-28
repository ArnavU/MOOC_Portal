import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux';
import { addCourseDetails, editCourseDetails, fetchCourseCategories } from '.././../../../../services/operations/courseDetailsAPI';
import { BiUpload } from 'react-icons/bi';
import RequirementField from './RequirementField';
import { setStep, setCourse, setEditCourse} from '../../../../../slices/courseSlice';
import IconBtn from '../../../../common/IconBtn';
import { COURSE_STATUS } from '../../../../../utils/constants';
import { toast } from 'react-hot-toast';
import Upload from './Upload'
import ChipInput from './ChipInput';

const CourseInformationForm = () => {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = useForm();

    const dispatch = useDispatch();
    const { course, editCourse } = useSelector((state) => state.course);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [courseCategories, setCourseCategories] = useState([]);
    const selectedCategory = watch("category");

    useEffect(() => {
        const getCategories = async () => {
            try {
                setCategoriesLoading(true);
            const categories = await fetchCourseCategories();
                if (categories?.length > 0) {
                setCourseCategories(categories);
                    // If editing and course has a category, set it after categories are loaded
                    if (editCourse && course?.category?._id) {
                        setValue("category", course.category._id);
                    }
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to fetch course categories");
            } finally {
                setCategoriesLoading(false); 
            }
        };

        getCategories();
    }, [editCourse, course, setValue]);

    useEffect(() => {
        if (editCourse && course) {
            setValue("courseName", course.courseName);
            setValue("courseCode", course.courseCode);
            setValue("courseDescription", course.courseDescription);
            setValue("tag", course.tag);
            setValue("whatYouWillLearn", course.whatYouWillLearn);
            setValue("instructions", course.instructions);
            setValue("thumbnail", course.thumbnail);
        }
    }, [editCourse, course, setValue]);

    const isFormUpdated = () => {
        const currentValues = getValues();
        if (!course) return true;

        return (
            currentValues.courseName !== course.courseName ||
            currentValues.courseDescription !== course.courseDescription ||
            currentValues.tag?.toString() !== course.tag?.toString() ||
            currentValues.whatYouWillLearn !== course.whatYouWillLearn ||
            currentValues.category !== course.category?._id ||
            currentValues.thumbnail !== course.thumbnail ||
            currentValues.instructions?.toString() !== course.instructions?.toString()
        );
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            let result;

            if (editCourse) {
                if (!isFormUpdated()) {
                    dispatch(setStep(2));
                    return;
                }

                const formData = new FormData();
                formData.append("courseId", course._id);

                // Only append changed fields
                if (data.courseName !== course.courseName) {
                    formData.append("courseName", data.courseName);
                }
                if (data.courseCode !== course.courseCode) {
                    formData.append("courseCode", data.courseCode);
                }
                if (data.courseDescription !== course.courseDescription) {
                    formData.append("courseDescription", data.courseDescription);
                }
                if (data.whatYouWillLearn !== course.whatYouWillLearn) {
                    formData.append("whatYouWillLearn", data.whatYouWillLearn);
                }
                if (data.category !== course.category?._id) {
                    formData.append("category", data.category);
                }
                if (data.instructions?.toString() !== course.instructions?.toString()) {
                    formData.append("instructions", JSON.stringify(data.instructions));
                }
                if (data.thumbnail !== course.thumbnail) {
                    formData.append("thumbnailImage", data.thumbnail);
                }
                result = await editCourseDetails(formData);
            } else {
                // Create new course
        const formData = new FormData();
        formData.append("courseName", data.courseName);
                formData.append("courseCode", data.courseCode);
        formData.append("courseDescription", data.courseDescription);
                formData.append("whatYouWillLearn", data.whatYouWillLearn);
                formData.append("category", data.category);
                formData.append("instructions", JSON.stringify(data.instructions));
        formData.append("status", COURSE_STATUS.DRAFT);
                formData.append("tag", JSON.stringify(data.tag));
                formData.append("thumbnailImage", data.thumbnail);

                result = await addCourseDetails(formData);
            }

            if (result) {
                dispatch(setEditCourse(false));
            dispatch(setStep(2));
            dispatch(setCourse(result));
                toast.success(editCourse ? "Course updated successfully" : "Course created successfully");
            }
        } catch (error) {
            console.error("Error in form submission:", error);
            toast.error("Failed to " + (editCourse ? "update" : "create") + " course");
        } finally {
            setLoading(false);
        }
    };

  return (
    <form
    onSubmit={handleSubmit(onSubmit)}
    className='space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6'
    >
        <div className='flex flex-col gap-5'>
            <div>
                    <label className='text-sm text-richblack-5' htmlFor='courseName'>
                        Course Name<sup className='text-pink-200'>*</sup>
                    </label>
                <input
                    type='text'
                    id='courseName'
                    placeholder='Enter Course Name'
                    {...register("courseName", {
                            required: "Course Name is required",
                            minLength: {
                                value: 3,
                                message: "Course Name must be at least 3 characters"
                            }
                    })}
                    className='form-style w-full'
                />
                {errors.courseName && (
                        <span className='ml-2 text-xs tracking-wide text-pink-200'>
                            {errors.courseName.message}
                        </span>
                    )}
                </div>

                <div>
                    <label className='text-sm text-richblack-5' htmlFor='courseCode'>
                        Course Code<sup className='text-pink-200'>*</sup>
                    </label>
                    <input
                        type='text'
                        id='courseCode'
                        placeholder='Enter Course Code'
                        {...register("courseCode", {
                            required: "Course Code is required",
                            minLength: {
                                value: 3,
                                message: "Course Code must be at least 3 characters"
                            },
                        })}
                        className='form-style w-full'
                    />
                    {errors.courseCode && (
                        <span className='ml-2 text-xs tracking-wide text-pink-200'>
                            {errors.courseCode.message}
                        </span>
                )}
            </div>

            <div>
                    <label className='text-sm text-richblack-5' htmlFor='courseDescription'>
                        Course Description<sup className='text-pink-200'>*</sup>
                    </label>
                <textarea
                    id='courseDescription'
                    placeholder='Enter Course Description'
                    {...register("courseDescription", {
                            required: "Course Description is required",
                            minLength: {
                                value: 10,
                                message: "Course Description must be at least 10 characters"
                            }
                        })}
                        className='form-style w-full min-h-[130px]'
                />
                {errors.courseDescription && (
                        <span className='ml-2 text-xs tracking-wide text-pink-200'>
                            {errors.courseDescription.message}
                        </span>
                )}
            </div>
        </div>

        <div className='flex flex-col space-y-2'>
                <label className='text-sm text-richblack-5' htmlFor='category'>
                    Course Category<sup className='text-pink-200'>*</sup>
                </label>
                <select
                    className='form-style w-full'
                    id='category'
            defaultValue=""
                    {...register("category", {
                        required: "Course Category is required"
                    })}
            >
                <option value="" disabled>Choose a Category</option>
                    {!categoriesLoading && courseCategories.map((category) => (
                        <option 
                            key={category._id} 
                            value={category._id}
                            selected={editCourse && course?.category?._id === category._id}
                        >
                            {category.name}
                        </option>
                    ))}
            </select>
                {categoriesLoading && (
                    <span className='text-sm text-richblack-300'>Loading categories...</span>
                )}
                {errors.category && (
                <span className='ml-2 text-xs tracking-wide text-pink-200'>
                        {errors.category.message}
                </span>
            )}
        </div>

        <ChipInput
            label="Tags"
                name="tag"
            placeholder="Enter tags and press enter"
            register={register}
            errors={errors}
            setValue={setValue}
                getValues={getValues}
        />

        <Upload
                name="thumbnail"
                label="Course Thumbnail"
            register={register}
            errors={errors}
            setValue={setValue}
            />
        
        <div className='flex flex-col space-y-2'>
                <label className='text-sm text-richblack-5'>
                    What You Will Learn<sup className='text-pink-200'>*</sup>
                </label>
            <textarea
                    id='whatYouWillLearn'
                    placeholder='Enter what students will learn in this course'
                    {...register("whatYouWillLearn", {
                        required: "Course benefits are required",
                        minLength: {
                            value: 10,
                            message: "Benefits must be at least 10 characters"
                        }
                    })}
            className='form-style resize-x-none min-h-[130px] w-full'
            />
                {errors.whatYouWillLearn && (
                <span className='ml-2 text-xs tracking-wide text-pink-200'>
                        {errors.whatYouWillLearn.message}
                </span>
            )}
        </div>

        <RequirementField
                name="instructions"
            label="Requirements/Instructions"
            register={register}
            errors={errors}
            setValue={setValue}
            getValues={getValues}
        />

            <div className='flex justify-end gap-x-4'>
                    <button
                    type="button"
                    onClick={() => dispatch(setStep(0))}
                    className='flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900'
                    >
                    Cancel
                    </button>
                <IconBtn
                    text={loading ? "Loading..." : (editCourse ? "Save Changes" : "Next")}
                    type="submit"
                    disabled={loading}
                />
        </div>
    </form>
    );
};

export default CourseInformationForm;
