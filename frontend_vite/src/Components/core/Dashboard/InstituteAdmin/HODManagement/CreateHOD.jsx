import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createHOD, getAllDepartments } from '../../../../../services/operations/instituteAdminAPI';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateHOD = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await getAllDepartments();
                if (response?.data?.success) {
                    setDepartments(response.data.data);
                } else {
                    throw new Error(response?.data?.message || "Failed to fetch departments");
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
                toast.error(error.message || "Failed to fetch departments");
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const onSubmit = async (data) => {
        try {
            const hodData = {
                departmentId: data.department,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                contactNumber: data.contactNumber
            };
            
            const response = await createHOD(hodData);
            if (response?.data?.success) {
                toast.success("HOD created successfully");
                reset();
                navigate('/dashboard/institute-admin/hods');
            } else {
                throw new Error(response?.data?.message || "Failed to create HOD");
            }
        } catch (error) {
            console.error("Error creating HOD:", error);
            toast.error(error.message || "Failed to create HOD");
        }
    };

    if (loading) {
        return <div className="text-center">Loading departments...</div>;
    }

    return (
        <div className="p-6 max-w-7xl min-w-[70%] mx-auto">
            <div className="flex justify-between items-center gap-4 mb-8">
                <h1 className="text-2xl font-bold text-richblack-5">Create HOD</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-richblack-5 mb-1">
                            First Name<sup className="text-pink-200">*</sup>
                        </label>
                        <input
                            {...register("firstName", { required: "First name is required" })}
                            type="text"
                            placeholder="Enter first name"
                            className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                        />
                        {errors.firstName && (
                            <span className="text-pink-200 text-xs">{errors.firstName.message}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-richblack-5 mb-1">
                            Last Name<sup className="text-pink-200">*</sup>
                        </label>
                        <input
                            {...register("lastName", { required: "Last name is required" })}
                            type="text"
                            placeholder="Enter last name"
                            className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                        />
                        {errors.lastName && (
                            <span className="text-pink-200 text-xs">{errors.lastName.message}</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-richblack-5 mb-1">
                            Email<sup className="text-pink-200">*</sup>
                        </label>
                        <input
                            {...register("email", { 
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                            type="email"
                            placeholder="Enter email"
                            className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                        />
                        {errors.email && (
                            <span className="text-pink-200 text-xs">{errors.email.message}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-richblack-5 mb-1">
                            Contact Number
                        </label>
                        <input
                            {...register("contactNumber")}
                            type="tel"
                            placeholder="Enter contact number"
                            className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-richblack-5 mb-1">
                        Password<sup className="text-pink-200">*</sup>
                    </label>
                    <input
                        {...register("password", { 
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters"
                            }
                        })}
                        type="password"
                        placeholder="Enter password"
                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                    />
                    {errors.password && (
                        <span className="text-pink-200 text-xs">{errors.password.message}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-richblack-5 mb-1">
                        Department<sup className="text-pink-200">*</sup>
                    </label>
                    <select
                        {...register("department", { required: "Department is required" })}
                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name} ({dept.code})
                            </option>
                        ))}
                    </select>
                    {errors.department && (
                        <span className="text-pink-200 text-xs">{errors.department.message}</span>
                    )}
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/institute-admin/hods')}
                        className="px-4 py-2 text-richblack-5 hover:text-richblack-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-50 text-richblack-900 rounded-md hover:bg-yellow-25 transition-all duration-200"
                    >
                        Create HOD
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateHOD; 