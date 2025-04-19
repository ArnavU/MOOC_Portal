import React, { useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa";

const EditInstituteModal = ({ isOpen, onClose, institute, onUpdate }) => {
    const [formData, setFormData] = useState({
        instituteName: "",
        instituteEmail: "",
        contactNumber: "",
        instituteAddress: "",
        website: "",
        instituteLogo: null,
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "",
    });

    useEffect(() => {
        if (institute) {
            setFormData({
                instituteName: institute.instituteName || "",
                instituteEmail: institute.instituteEmail || "",
                contactNumber: institute.contactNumber || "",
                instituteAddress: institute.instituteAddress || "",
                website: institute.website || "",
                instituteLogo: null,
                adminFirstName: institute.admin?.firstName || "",
                adminLastName: institute.admin?.lastName || "",
                adminEmail: institute.admin?.email || "",
            });
        }
    }, [institute]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                instituteLogo: file,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-richblack-800 rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-medium text-richblack-5 mb-6 sticky top-0 bg-richblack-800 pb-4">Edit Institute</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-richblack-5">
                                Institute Name <sup className="text-pink-200">*</sup>
                            </label>
                            <input
                                required
                                type="text"
                                name="instituteName"
                                value={formData.instituteName}
                                onChange={handleChange}
                                className="w-full rounded-md bg-richblack-700 p-3 text-richblack-5 border-b border-richblack-200 focus:outline-none focus:border-yellow-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-richblack-5">
                                Email <sup className="text-pink-200">*</sup>
                            </label>
                            <input
                                required
                                type="email"
                                name="instituteEmail"
                                value={formData.instituteEmail}
                                onChange={handleChange}
                                className="w-full rounded-md bg-richblack-700 p-3 text-richblack-5 border-b border-richblack-200 focus:outline-none focus:border-yellow-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-richblack-5">
                                Contact Number <sup className="text-pink-200">*</sup>
                            </label>
                            <input
                                required
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                className="w-full rounded-md bg-richblack-700 p-3 text-richblack-5 border-b border-richblack-200 focus:outline-none focus:border-yellow-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-richblack-5">
                                Website
                            </label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full rounded-md bg-richblack-700 p-3 text-richblack-5 border-b border-richblack-200 focus:outline-none focus:border-yellow-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-richblack-5">
                            Address <sup className="text-pink-200">*</sup>
                        </label>
                        <textarea
                            required
                            name="instituteAddress"
                            value={formData.instituteAddress}
                            onChange={handleChange}
                            className="w-full rounded-md bg-richblack-700 p-3 text-richblack-5 border-b border-richblack-200 focus:outline-none focus:border-yellow-50 min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-richblack-5">
                            Institute Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer bg-richblack-700 p-3 rounded-md hover:bg-richblack-600 transition-all duration-200">
                                <FaUpload className="text-lg" />
                                <span>Upload Logo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            {formData.instituteLogo && (
                                <span className="text-richblack-200">
                                    {formData.instituteLogo.name}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-richblack-700 pt-6">
                        <h3 className="text-xl font-medium text-richblack-5 mb-4">Admin Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-richblack-5">
                                    Admin First Name <sup className="text-pink-200">*</sup>
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="adminFirstName"
                                    value={formData.adminFirstName}
                                    onChange={handleChange}
                                    className="w-full rounded-md bg-richblack-700 p-3 text-richblack-5 border-b border-richblack-200 focus:outline-none focus:border-yellow-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-richblack-5">
                                    Admin Last Name <sup className="text-pink-200">*</sup>
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="adminLastName"
                                    value={formData.adminLastName}
                                    onChange={handleChange}
                                    className="w-full rounded-md bg-richblack-700 p-3 text-richblack-5 border-b border-richblack-200 focus:outline-none focus:border-yellow-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-richblack-5">
                                    Admin Email <sup className="text-pink-200">*</sup>
                                </label>
                                <input
                                    required
                                    type="email"
                                    name="adminEmail"
                                    value={formData.adminEmail}
                                    onChange={handleChange}
                                    className="w-full rounded-md bg-richblack-700 p-3 text-richblack-5 border-b border-richblack-200 focus:outline-none focus:border-yellow-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex items-center gap-x-2 rounded-md bg-richblack-700 py-2 px-4 text-richblack-5 hover:bg-richblack-600 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-x-2 rounded-md bg-yellow-50 py-2 px-4 font-semibold text-richblack-900 hover:bg-yellow-100 transition-all duration-200"
                        >
                            Update Institute
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditInstituteModal; 