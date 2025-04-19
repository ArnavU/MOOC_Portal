import { apiConnector } from "../apiConnector";
import { HOD_API } from "../apis";
import { toast } from "react-hot-toast";


export const getDepartmentStudents = async () => {
    console.log("Getting Department Students");
    try {
        const response = await apiConnector("GET", HOD_API.GET_DEPARTMENT_STUDENTS);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        console.log("Department Students:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error registering students:", error);
        throw error;
    }
};

export const registerStudents = async (students) => {
    try {
        const response = await apiConnector("POST", HOD_API.REGISTER_STUDENTS, { students });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        console.log("Registration Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error registering students:", error);
        throw error;
    }
};

export const updateStudent = async (studentId, data) => {
    try {
        const response = await apiConnector("PUT", HOD_API.UPDATE_STUDENT, data);
        return response;
    } catch (error) {
        console.error("Error updating student:", error);
        throw error;
    }
};

export const deleteStudents = async (studentIds) => {
    try {
        const response = await apiConnector("DELETE", HOD_API.DELETE_STUDENTS, {
            studentIds
        });
        return response;
    } catch (error) {
        console.error("Error deleting students:", error);
        throw error;
    }
};

// Faculty Management Services
export const getAllFaculty = async () => {
    try {
        const response = await apiConnector("GET", HOD_API.GET_ALL_FACULTY);
        return response;
    } catch (error) {
        console.error("Error fetching faculty:", error);
        throw error;
    }
};

export const createFaculty = async (data) => {
    try {
        const response = await apiConnector("POST", HOD_API.CREATE_FACULTY, data);
        return response;
    } catch (error) {
        console.error("Error creating faculty:", error);
        throw error;
    }
};

export const updateFaculty = async (facultyId, data) => {
    try {
        const response = await apiConnector("PUT", HOD_API.UPDATE_FACULTY, {
            facultyId,
            ...data
        });
        return response;
    } catch (error) {
        console.error("Error updating faculty:", error);
        throw error;
    }
};

export const deleteFaculty = async (facultyId) => {
    try {
        const response = await apiConnector("DELETE", HOD_API.DELETE_FACULTY + facultyId);
        return response;
    } catch (error) {
        console.error("Error deleting faculty:", error);
        throw error;
    }
};

// Get faculty list
export const getFacultyList = async () => {
    const toastId = toast.loading("Loading...");
    try {
        const response = await apiConnector("GET", HOD_API.GET_FACULTY_LIST);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Faculty list fetched successfully");
        return response.data.data;
    } catch (error) {
        console.error("Error fetching faculty list:", error);
        toast.error(error.response?.data?.message || "Failed to fetch faculty list");
        return [];
    } finally {
        toast.dismiss(toastId);
    }
};

// Register new faculty member
export const registerFaculty = async (newFaculty) => {
    const toastId = toast.loading("Registering faculty member...");
    try {
        const formData = new FormData();
        
        // Add all text fields from newFaculty state
        Object.keys(newFaculty).forEach(key => {
            if (key !== 'profilePhoto' && newFaculty[key] !== undefined) {
                formData.append(key, newFaculty[key]);
            }
        });
        
        // Add profile photo if it exists
        if (newFaculty.profilePhoto instanceof File) {
            formData.append('profilePhoto', newFaculty.profilePhoto);
        }

        const response = await apiConnector("POST", HOD_API.POST_REGISTER_FACULTY, formData, {
            "Content-Type": "multipart/form-data"
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Faculty member registered successfully");
        return response.data.data;
    } catch (error) {
        console.error("Error registering faculty:", error);
        toast.error(error.response?.data?.message || "Failed to register faculty member");
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
};

// Edit faculty member
export const editFaculty = async (data) => {
    const toastId = toast.loading("Updating faculty details...");
    try {
        const formData = new FormData();
        
        // Append all text fields
        Object.keys(data).forEach(key => {
            if (key !== 'image' && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        // Append profile photo if exists
        if (data.image instanceof File) {
            formData.append('image', data.image);
        }

        const response = await apiConnector("PUT", HOD_API.PUT_EDIT_FACULTY, formData, {
            "Content-Type": "multipart/form-data"
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Faculty details updated successfully");
        return response.data.data;
    } catch (error) {
        console.error("Error updating faculty:", error);
        toast.error(error.response?.data?.message || "Failed to update faculty details");
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
}; 