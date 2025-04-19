import { apiConnector } from "../apiConnector";
import { INSTITUTE_ADMIN_API } from "../apis";
import { toast } from "react-hot-toast";

// HOD Management Services
export const getAllHODs = async () => {
    try {
        const response = await apiConnector("GET", INSTITUTE_ADMIN_API.GET_ALL_HODS);
        console.log("HODs fetched successfully:", response);
        return response;
    } catch (error) {
        console.error("Error fetching HODs:", error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to fetch HODs");
        throw error
    }
};

export const getHODById = async (hodId) => {
    try {
        const response = await apiConnector("GET", INSTITUTE_ADMIN_API.GET_HOD_BY_ID + hodId);
        return response;
    } catch (error) {
        console.error("Error fetching HOD:", error);
        throw error;
    }
};

export const createHOD = async (data) => {
    try {
        const response = await apiConnector("POST", INSTITUTE_ADMIN_API.CREATE_HOD, {
            departmentId: data.departmentId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            contactNumber: data.contactNumber,
            password: data.password
        });
        return response;
    } catch (error) {
        console.error("Error creating HOD:", error);
        throw error;
    }
};

export const updateHOD = async (hodId, data) => {;
    console.log("URL: ", INSTITUTE_ADMIN_API.UPDATE_HOD);
    try {
        const response = await apiConnector("PUT", INSTITUTE_ADMIN_API.UPDATE_HOD, {
            contactNumber: data.contactNumber,
            hodId: hodId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            departmentId: data.departmentId
        });
        console.log("Response: ", response);
        return response;
    } catch (error) {
        console.error("Error updating HOD:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred while updating the HOD");
        throw error?.response?.data?.message || error?.message || "An error occurred while updating the HOD";
    }
};

export const deleteHOD = async (hodId) => {
    try {
        const response = await apiConnector("DELETE", INSTITUTE_ADMIN_API.DELETE_HOD + hodId);
        return response;
    } catch (error) {
        console.error("Error deleting HOD:", error);
        throw error;
    }
};

// Department Management Services
export const getAllDepartments = async () => {
    try {
        const response = await apiConnector("GET", INSTITUTE_ADMIN_API.GET_ALL_DEPARTMENTS);
        return response;
    } catch (error) {
        console.error("Error fetching departments:", error);
        throw error;
    }
};

export const getDepartmentById = async (departmentId) => {
    try {
        const response = await apiConnector("GET", INSTITUTE_ADMIN_API.GET_DEPARTMENT_BY_ID + departmentId);
        return response;
    } catch (error) {
        console.error("Error fetching department:", error);
        throw error;
    }
};

export const createDepartment = async (data) => {
    console.log("Data for creating department: ", data)
    try {
        const response = await apiConnector("POST", INSTITUTE_ADMIN_API.CREATE_DEPARTMENT, {
            name: data.name,
            code: data.code,
            description: data.description
        });
        console.log("Department created successfully:", response);
        return response;
    } catch (error) {
        console.error("Error creating department:", error);
        throw error;
    }
};

export const updateDepartment = async (departmentId, data) => {
    try {
        const response = await apiConnector("PUT", INSTITUTE_ADMIN_API.UPDATE_DEPARTMENT, {
            departmentId: departmentId,
            name: data.name,
            code: data.code,
            description: data.description
        });
        return response;
    } catch (error) {
        console.error("Error updating department:", error);
        throw error;
    }
};

export const deleteDepartment = async (departmentId) => {
    try {
        const response = await apiConnector("DELETE", INSTITUTE_ADMIN_API.DELETE_DEPARTMENT + departmentId);
        return response;
    } catch (error) {
        console.error("Error deleting department:", error);
        throw error;
    }
};
