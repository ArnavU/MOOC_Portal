import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllInstitutes, updateInstitute } from "../../../../services/operations/serviceProviderAPI";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import EditInstituteModal from "./EditInstituteModal";

const CreateInstitute = () => {
    const navigate = useNavigate();
    const [institutes, setInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchInstitutes = async () => {
        setLoading(true);
        try {
            const response = await getAllInstitutes();
            if (response) {
                setInstitutes(response);
                console.log("Institutes:", response);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch institutes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstitutes();
    }, []);

    const handleEdit = (institute) => {
        setSelectedInstitute(institute);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (formData) => {
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("instituteId", selectedInstitute._id);
            Object.keys(formData).forEach((key) => {
                if (key === "instituteLogo" && formData[key]) {
                    formDataToSend.append(key, formData[key]);
                } else if (formData[key]) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await updateInstitute(selectedInstitute._id, formDataToSend);
            if (response?.success) {
                setIsEditModalOpen(false);
                fetchInstitutes();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update institute");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (instituteId) => {
        console.log("Delete institute:", instituteId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-50"></div>
            </div>
        );
    }

    return (
        <div className="text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-medium text-richblack-5">My Institutes</h1>
                <button
                    onClick={() => navigate("/dashboard/create-institute")}
                    className="flex items-center gap-x-2 rounded-md bg-yellow-50 py-2 px-4 font-semibold text-richblack-900 hover:bg-yellow-100 transition-all duration-200"
                >
                    <FaPlus className="text-lg" />
                    <span>Create Institute</span>
                </button>
            </div>

            {institutes.length === 0 ? (
                <div className="text-center p-12 bg-richblack-800 rounded-lg">
                    <h2 className="text-xl font-semibold text-richblack-5 mb-4">
                        No Institutes Created Yet
                    </h2>
                    <p className="text-richblack-200 mb-6">
                        Start by creating your first institute to manage courses and departments.
                    </p>
                    <button
                        onClick={() => navigate("/dashboard/create-institute")}
                        className="bg-yellow-50 text-richblack-900 px-6 py-2 rounded-md font-medium hover:bg-yellow-25 transition-all duration-200"
                    >
                        Create Your First Institute
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {institutes.map((institute) => (
                        <div
                            key={institute._id}
                            className="bg-richblack-800 rounded-lg overflow-hidden hover:bg-richblack-700 transition-all duration-200 flex flex-col h-full"
                        >
                            <div className="relative h-48">
                                {institute.instituteLogo ? (
                                    <img
                                        src={institute.instituteLogo}
                                        alt={institute.instituteName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-richblack-700 flex items-center justify-center">
                                        <span className="text-richblack-200">No Logo Available</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h2 className="text-xl font-medium text-richblack-5 mb-4">{institute.instituteName}</h2>
                                <div className="space-y-2 flex-grow">
                                    <p className="text-richblack-200">
                                        <span className="font-medium text-richblack-5">Email:</span>{" "}
                                        {institute.instituteEmail}
                                    </p>
                                    <p className="text-richblack-200">
                                        <span className="font-medium text-richblack-5">Contact:</span>{" "}
                                        {institute.contactNumber}
                                    </p>
                                    <p className="text-richblack-200">
                                        <span className="font-medium text-richblack-5">Address:</span>{" "}
                                        {institute.instituteAddress}
                                    </p>
                                    {institute.website && (
                                        <p className="text-richblack-200">
                                            <span className="font-medium text-richblack-5">Website:</span>{" "}
                                            {institute.website}
                                        </p>
                                    )}
                                    {institute.admin && (
                                        <>
                                            <p className="text-richblack-200">
                                                <span className="font-medium text-richblack-5">Admin Name:</span>{" "}
                                                {`${institute.admin.firstName} ${institute.admin.lastName}`}
                                            </p>
                                            <p className="text-richblack-200">
                                                <span className="font-medium text-richblack-5">Admin Email:</span>{" "}
                                                {institute.admin.email}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => handleEdit(institute)}
                                        className="flex items-center gap-x-2 rounded-md bg-richblack-700 py-2 px-4 text-richblack-5 hover:bg-richblack-600 transition-all duration-200"
                                    >
                                        <FaEdit className="text-lg" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(institute._id)}
                                        className="flex items-center gap-x-2 rounded-md bg-pink-700 py-2 px-4 text-richblack-5 hover:bg-pink-600 transition-all duration-200"
                                    >
                                        <FaTrash className="text-lg" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <EditInstituteModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                institute={selectedInstitute}
                onUpdate={handleUpdate}
            />
        </div>
    );
};

export default CreateInstitute;