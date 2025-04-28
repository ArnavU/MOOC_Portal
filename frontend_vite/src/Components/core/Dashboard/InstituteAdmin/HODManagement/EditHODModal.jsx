import React, { useEffect, useState } from "react";
import { updateHOD } from "../../../../../services/operations/instituteAdminAPI.js";
import { toast } from "react-hot-toast";

const EditHODModal = ({ isOpen, onClose, hod, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    contactNumber: "",
  });

  useEffect(() => {
    if (hod) {
      setFormData({
        firstName: hod.firstName || "",
        lastName: hod.lastName || "",
        email: hod.email || "",
        departmentId: hod.department?._id || "",
        contactNumber: hod.additionalDetails?.contactNumber || "",
      });
    }
  }, [hod]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateHOD(hod._id, formData);
      if (response?.data?.success) {
        toast.success("HOD updated successfully");
        onUpdate();
        onClose();
      } else {
        throw new Error(response?.data?.message || "Failed to update HOD");
      }
    } catch (error) {
      console.error("Error updating HOD:", error);
      toast.error(error.message || "Failed to update HOD");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-richblack-900 bg-opacity-50">
      <div className="bg-richblack-800 p-8 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-richblack-5">
            Edit HOD
          </h2>
          <button
            onClick={onClose}
            className="text-richblack-400 hover:text-richblack-5"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-richblack-5 mb-1">
                First Name<sup className="text-pink-200">*</sup>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-richblack-5 mb-1">
                Last Name<sup className="text-pink-200">*</sup>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-richblack-5 mb-1">
              Email<sup className="text-pink-200">*</sup>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-richblack-5 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-richblack-5 hover:text-richblack-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-50 text-richblack-900 rounded-md hover:bg-yellow-25 transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHODModal; 