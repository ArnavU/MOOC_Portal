import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { registerStudents } from "../../../../../services/operations/HODAPI";
import { toast } from "react-hot-toast";
import ErrorModal from "./ErrorModal";

const AddStudentModal = ({ isOpen, onClose, onAddStudent }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.profile);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [apiErrors, setApiErrors] = useState({ validationErrors: [], errorMessages: [] });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            
            // Format the student data according to the API requirements
            const studentData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                rollNumber: data.rollNumber,
                prn: data.prn,
                batch: data.batch,
                currentYear: data.currentYear,
                semester: data.semester,
                contactNumber: data.contactNumber,
                department: user.department.name,
            };

            // Call the API to register the student
            try {
                const response = await registerStudents([studentData]);
                console.log("Registration Response: ", response);
                toast.success("Student registered successfully");
                reset();
                onClose();
                if (onAddStudent) {
                    onAddStudent();
                }
            } catch (error) {
                console.error("Error registering student:", error);
                toast.error(error.response.data.message || "Failed to register student");
                if (error.response.data.validationErrors) {
                    setApiErrors({
                        validationErrors: error.response.data.validationErrors || []
                    });
                    setShowErrorModal(true);
                } else {
                    throw new Error(error.response.data.message || "Failed to register student");
                }
            } finally {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error registering student:", error);
            toast.error(error.message || "Failed to register student");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-richblack-800 p-6 rounded-lg w-full max-w-2xl">
                    <h2 className="text-2xl font-bold text-richblack-5 mb-4">Add New Student</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-richblack-5 mb-1">First Name</label>
                                <input
                                    type="text"
                                    {...register("firstName", { required: "First name is required" })}
                                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                />
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-pink-200">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-richblack-5 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    {...register("lastName", { required: "Last name is required" })}
                                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-pink-200">{errors.lastName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-richblack-5 mb-1">Email</label>
                                <input
                                    type="email"
                                    {...register("email", { 
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-pink-200">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-richblack-5 mb-1">Roll Number</label>
                                <input
                                    type="text"
                                    {...register("rollNumber", { required: "Roll number is required" })}
                                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                />
                                {errors.rollNumber && (
                                    <p className="mt-1 text-sm text-pink-200">{errors.rollNumber.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-richblack-5 mb-1">PRN</label>
                                <input
                                    type="text"
                                    {...register("prn", { required: "PRN is required" })}
                                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                />
                                {errors.prn && (
                                    <p className="mt-1 text-sm text-pink-200">{errors.prn.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-richblack-5 mb-1">Batch</label>
                                <input
                                    type="text"
                                    {...register("batch", { required: "Batch is required" })}
                                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                />
                                {errors.batch && (
                                    <p className="mt-1 text-sm text-pink-200">{errors.batch.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-richblack-5 mb-1">Current Year</label>
                                <select
                                    {...register("currentYear", { required: "Current year is required" })}
                                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                >
                                    <option value="">Select Year</option>
                                    <option value="FY">FY</option>
                                    <option value="SY">SY</option>
                                    <option value="TY">TY</option>
                                    <option value="BTech">BTech</option>
                                </select>
                                {errors.currentYear && (
                                    <p className="mt-1 text-sm text-pink-200">{errors.currentYear.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-richblack-5 mb-1">Semester</label>
                                <select
                                    {...register("semester", { required: "Semester is required" })}
                                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                >
                                    <option value="">Select Semester</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                                {errors.semester && (
                                    <p className="mt-1 text-sm text-pink-200">{errors.semester.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-richblack-5 mb-1">Contact Number</label>
                                <input
                                    type="tel"
                                    {...register("contactNumber", { 
                                        required: "Contact number is required",
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: "Contact number must be 10 digits"
                                        }
                                    })}
                                    className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                />
                                {errors.contactNumber && (
                                    <p className="mt-1 text-sm text-pink-200">{errors.contactNumber.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-richblack-5 mb-1">Department</label>
                                <div className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5 opacity-75 cursor-not-allowed">
                                    {user?.department?.name || "Loading..."}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-richblack-700 text-richblack-5 rounded hover:bg-richblack-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-yellow-50 text-richblack-900 rounded hover:bg-yellow-25 disabled:opacity-50"
                            >
                                {loading ? "Adding..." : "Add Student"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                validationErrors={apiErrors.validationErrors}
                errorMessages={apiErrors.errorMessages}
            />
        </>
    );
};

export default AddStudentModal; 