import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { studentEndpoints } from "../apis";
const {
    GET_ENROLLED_COURSES_API,
    GET_UNENROLLED_COURSES_API,
    ENROLL_IN_COURSE_API
} = studentEndpoints;

// Get all allocated courses for the student
export const getAllocatedCourses = async () => {
    const toastId = toast.loading("Loading allocated courses...");
    try {
        const response = await apiConnector("GET", GET_UNENROLLED_COURSES_API);
        console.log("GET UNENROLLED COURSES API RESPONSE............", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Courses fetched successfully");
        return response.data.data;
    } catch (error) {
        console.log("GET ALLOCATED COURSES API ERROR............", error);
        toast.error(error.response?.data?.message || "Failed to fetch allocated courses");
        return null;
    } finally {
        toast.dismiss(toastId);
    }
};

// Get all enrolled courses for the student
export const getEnrolledCourses = async () => {
    const toastId = toast.loading("Loading enrolled courses...");
    try {
        const response = await apiConnector("GET", GET_ENROLLED_COURSES_API);
        console.log("GET ENROLLED COURSES API RESPONSE............", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Courses fetched successfully");
        return response.data.data;
    } catch (error) {
        console.log("GET ENROLLED COURSES API ERROR............", error);
        toast.error(error.response?.data?.message || "Failed to fetch enrolled courses");
        return null;
    } finally {
        toast.dismiss(toastId);
    }
};

// Enroll in a course
export const enrollInCourse = async (courseId, token) => {
    const toastId = toast.loading("Enrolling in course...");
    try {
        const response = await apiConnector("POST", studentEndpoints.ENROLL_IN_COURSE_API, { courseId });
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        toast.success("Successfully enrolled in course");
        return response.data;
    } catch (error) {
        console.log("ENROLL COURSE API ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to enroll in course");
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
};