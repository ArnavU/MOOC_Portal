import axios from "axios";

export const axiosInstance = axios.create({
    withCredentials: true,  // This ensures cookies are sent with requests
});

export const apiConnector = async (method, url, bodyData, headers, params) => {
    try {
        const response = await axiosInstance({
            method: method,
            url: url,
            data: bodyData ? bodyData : null,
            headers: headers ? headers : null,
            params: params ? params : null
        });

        return response;
    } catch (error) {
        if (error.response?.data?.message === "Token is invalid") {
            localStorage.clear();
            window.location.href = "/login";
        }
        console.log("API Connector Error: ", error);
        throw error;
    }
};