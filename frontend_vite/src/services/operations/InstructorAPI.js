import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { instructorEndpoints } from "../apis";

const { GET_DEPARTMENT_STUDENTS, ALLOCATE_COURSE_API, COURSE_ALLOCATIONS_API } = instructorEndpoints;

export const fetchDepartmentStudents = async () => {
    const toastId = toast.loading("Loading...");
    try {
        const response = await apiConnector("GET", GET_DEPARTMENT_STUDENTS);
        console.log("GET DEPARTMENT STUDENTS API RESPONSE............", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        return response.data.data;
    } catch (error) {
        console.log("GET DEPARTMENT STUDENTS API ERROR............", error);
        toast.error(error.response?.data?.message || "Failed to fetch students");
        return [];
    } finally {
        toast.dismiss(toastId);
    }
};

export const allocateCourseToStudents = async (studentIds, courseId) => {
    const toastId = toast.loading("Allocating course to students...");
    try {
        const response = await apiConnector("POST", ALLOCATE_COURSE_API, 
            { studentIds, courseId }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        // toast.success("Course allocated successfully");
        return response.data;
    } catch (error) {
        console.log("ALLOCATE_COURSE_API ERROR............", error);
        toast.error("Failed to allocate course");
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
};

export const fetchCourseAllocations = async (token) => {
    const toastId = toast.loading("Loading course allocations...");
    try {
        const response = await apiConnector("GET", COURSE_ALLOCATIONS_API, null, {
            Authorization: `Bearer ${token}`
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Course allocations fetched successfully");
        return response.data.data;
    } catch (error) {
        console.error("Error fetching course allocations:", error);
        toast.error(error.response?.data?.message || "Failed to fetch course allocations");
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
};
