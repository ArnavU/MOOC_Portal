import React from 'react';
import { useForm } from 'react-hook-form';
import { createDepartment } from '../../../../../services/operations/instituteAdminAPI.js';
import { toast } from 'react-hot-toast';

const CreateDepartment = ({ onSuccess }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            await createDepartment(data);
            toast.success("Department created successfully");
            reset();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error creating department:", error);
        }
    };

    return (
        <div className="p-6 max-w-7xl min-w-[70%] mx-auto">
            <h1 className="text-2xl font-bold text-richblack-5 mb-8">Create Department</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="text-sm text-richblack-5">
                        Department Name<sup className="text-pink-200">*</sup>
                    </label>
                    <input
                        {...register("name", { required: "Department name is required" })}
                        type="text"
                        placeholder="Enter department name"
                        className="form-style w-full"
                    />
                    {errors.name && (
                        <span className="text-pink-200 text-xs">{errors.name.message}</span>
                    )}
                </div>

                <div>
                    <label className="text-sm text-richblack-5">
                        Department Code<sup className="text-pink-200">*</sup>
                    </label>
                    <input
                        {...register("code", { required: "Department code is required" })}
                        type="text"
                        placeholder="Enter department code"
                        className="form-style w-full"
                    />
                    {errors.code && (
                        <span className="text-pink-200 text-xs">{errors.code.message}</span>
                    )}
                </div>

                <div>
                    <label className="text-sm text-richblack-5">Description</label>
                    <textarea
                        {...register("description")}
                        placeholder="Enter department description"
                        className="form-style w-full min-h-[100px]"
                    />
                </div>

                <button
                    type="submit"
                    className="mt-6 rounded-md bg-yellow-50 px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
                             transition-all duration-200 hover:scale-95 hover:shadow-none"
                >
                    Create Department
                </button>
            </form>
        </div>
    );
};

export default CreateDepartment; 