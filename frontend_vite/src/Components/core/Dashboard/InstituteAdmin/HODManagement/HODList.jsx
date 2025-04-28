import React, { useEffect, useState } from 'react';
import { getAllHODs, deleteHOD } from '../../../../../services/operations/InstituteAdminAPI.js';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EditHODModal from "./EditHODModal";

const HODList = () => {
    const [hods, setHODs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHOD, setSelectedHOD] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHODs = async () => {
            try {
                const response = await getAllHODs();
                if (response?.data?.success) {
                    setHODs(response.data.data);
                } 
            } finally {
                setLoading(false);
            }
        };

        fetchHODs();
    }, []);

    const handleEdit = (hod) => {
        setSelectedHOD(hod);
        setIsModalOpen(true);
    };

    const handleDelete = async (hodId) => {
        try {
            const response = await deleteHOD(hodId);
            if (response?.data?.success) {
                toast.success("HOD deleted successfully");
                setHODs(hods.filter(hod => hod._id !== hodId));
            } else {
                throw new Error(response?.data?.message || "Failed to delete HOD");
            }
        } catch (error) {
            console.error("Error deleting HOD:", error);
            toast.error(error.message || "Failed to delete HOD");
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await getAllHODs();
            if (response?.data?.success) {
                setHODs(response.data.data);
            }
        } catch (error) {
            console.error("Error refreshing HODs:", error);
        }
    };

    const handleCreateHOD = () => {
        navigate("/dashboard/institute-admin/hods/create");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-50"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl min-w-[70%] mx-auto">
            <div className="flex justify-between items-center gap-4 mb-8">
                <h1 className="text-2xl font-bold text-richblack-5">Heads of Department</h1>
                <button
                    onClick={handleCreateHOD}
                    className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-md font-medium hover:bg-yellow-25 transition-all duration-200"
                >
                    Create HOD
                </button>
            </div>

            {hods.length === 0 ? (
                <div className="text-center py-16 px-8 bg-richblack-800 rounded-lg">
                    <h2 className="text-xl font-semibold text-richblack-5 mb-4">
                        No HODs Created Yet
                    </h2>
                    <p className="text-richblack-200 mb-8">
                        Start by creating your first Head of Department to manage departments and courses.
                    </p>
                    <button
                        onClick={handleCreateHOD}
                        className="bg-yellow-50 text-richblack-900 px-6 py-2 rounded-md font-medium hover:bg-yellow-25 transition-all duration-200"
                    >
                        Create Your First HOD
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hods.map((hod) => (
                        <div
                            key={hod._id}
                            className="bg-richblack-800 p-6 rounded-lg shadow-lg"
                        >
                            <h2 className="text-xl font-semibold text-richblack-5 mb-2">
                                {`${hod.firstName} ${hod.lastName}`}
                            </h2>
                            <p className="text-richblack-200 mb-2">
                                <span className="font-medium text-richblack-5">Email:</span>{" "}
                                {hod.email}
                            </p>
                            {hod.department && (
                                <p className="text-richblack-200 mb-2">
                                    <span className="font-medium text-richblack-5">Department:</span>{" "}
                                    {hod.department.name} ({hod.department.code})
                                </p>
                            )}
                            {hod?.additionalDetails?.contactNumber && (
                                <p className="text-richblack-200 mb-4">
                                    <span className="font-medium text-richblack-5">Contact Number:</span>{" "}
                                    {hod?.additionalDetails?.contactNumber}
                                </p>
                            )}
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => handleEdit(hod)}
                                    className="flex items-center gap-2 text-yellow-50 hover:text-yellow-25 transition-all duration-200"
                                >
                                    <FaEdit className="text-lg" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(hod._id)}
                                    className="flex items-center gap-2 text-pink-200 hover:text-pink-100 transition-all duration-200"
                                >
                                    <FaTrash className="text-lg" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <EditHODModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedHOD(null);
                }}
                hod={selectedHOD}
                onUpdate={handleUpdate}
            />
        </div>
    );
};

export default HODList; 