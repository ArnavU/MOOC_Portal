import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { supervisorEndpoints } from "../apis";

const { CREATE_INSTITUTE_API, GET_ALL_INSTITUTES_API, UPDATE_INSTITUTE_API, CREATE_CATEGORY_API, GET_ALL_CATEGORIES_API, UPDATE_CATEGORY_API, DELETE_CATEGORY_API } = supervisorEndpoints;

export const createInstitute = async (formData) => {
    const toastId = toast.loading("Creating Institute...");
    let result = null;
    try {
        const response = await apiConnector("POST", CREATE_INSTITUTE_API, formData, {
            "Content-Type": "multipart/form-data",
        });

        if (!response?.data?.success) {
            throw new Error("Could Not Create Institute");
        }

        toast.success("Institute Created Successfully");
        toast.dismiss(toastId);
        return {success: true};
    } catch (error) {
        console.log("CREATE_INSTITUTE_API API ERROR............", error);
        toast.error(error?.response?.data?.message || "Failed to create institute");
    }
    toast.dismiss(toastId);
    return {success: false};
}; 

export const getAllInstitutes = async () => {
    const toastId = toast.loading("Loading Institutes...");
    let result = null;
    try {
        const response = await apiConnector("GET", GET_ALL_INSTITUTES_API);
        if (!response?.data?.success) {
            throw new Error("Could Not Fetch Institutes");
        }

        result = response?.data?.data;
    } catch (error) {
        console.log("GET_ALL_INSTITUTES_API API ERROR............", error);
        toast.error(error?.response?.data?.message || "Failed to fetch institutes");
    }
    toast.dismiss(toastId);
    return result;
};

export const updateInstitute = async (instituteId, formData, token) => {
    const toastId = toast.loading("Updating Institute...");
    try {
        const response = await apiConnector("PUT", UPDATE_INSTITUTE_API, formData, {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        });

        if (!response?.data?.success) {
            throw new Error("Could Not Update Institute");
        }

        toast.success("Institute Updated Successfully");
        return response.data;
    } catch (error) {
        console.log("UPDATE_INSTITUTE_API ERROR............", error);
        toast.error(error?.response?.data?.message || "Failed to update institute");
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
};


export const createCategory = async (formData, token) => {
    const toastId = toast.loading("Creating Category...");
    try {
        const response = await apiConnector("POST", CREATE_CATEGORY_API, formData, {
            Authorization: `Bearer ${token}`,
        });

        if (!response?.data?.success) {
            throw new Error("Could Not Create Category");
        }

        toast.success("Category Created Successfully");
        return response.data;
    } catch (error) {
        console.log("CREATE_CATEGORY_API ERROR............", error);
        toast.error(error?.response?.data?.message || "Failed to create category");
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
};

export const getAllCategories = async () => {
    const toastId = toast.loading("Loading Categories...");
    try {
        const response = await apiConnector("GET", GET_ALL_CATEGORIES_API);
        console.log("GET_ALL_CATEGORIES_API RESPONSE............", response);
        if (!response?.data?.success) {
            throw new Error("Could Not Fetch Categories");
        }

        return response.data.data;
    } catch (error) {
        console.log("GET_ALL_CATEGORIES_API ERROR............", error);
        toast.error(error?.response?.data?.message || "Failed to fetch categories");
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
};

export const updateCategory = async (categoryId, formData, token) => {
    const toastId = toast.loading("Updating Category...");
    try {
        const response = await apiConnector(
            "PUT",
            UPDATE_CATEGORY_API,
            { categoryId, ...formData },
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error("Could Not Update Category");
        }

        toast.success("Category Updated Successfully");
        return response.data;
    } catch (error) {
        console.log("UPDATE_CATEGORY_API ERROR............", error);
        toast.error(error?.response?.data?.message || "Failed to update category");
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
};

export const deleteCategory = async (categoryId, token) => {
    const toastId = toast.loading("Deleting Category...");
    try {
        const response = await apiConnector(
            "DELETE",
            `${DELETE_CATEGORY_API}/${categoryId}`,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error("Could Not Delete Category");
        }

        toast.success("Category Deleted Successfully");
        return response.data;
    } catch (error) {
        console.log("DELETE_CATEGORY_API ERROR............", error);
        toast.error(error?.response?.data?.message || "Failed to delete category");
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
};