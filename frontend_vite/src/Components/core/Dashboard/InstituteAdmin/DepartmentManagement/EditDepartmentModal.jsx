import React, { useEffect, useState } from "react";
import { updateDepartment } from "../../../../../services/operations/InstituteAdminAPI.js";
import { toast } from "react-hot-toast";

const EditDepartmentModal = ({ isOpen, onClose, department, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        code: department.code || "",
        description: department.description || "",
      });
    }
  }, [department]);

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
      const response = await updateDepartment(department._id, formData);
      if (response?.data?.success) {
        toast.success("Department updated successfully");
        onUpdate();
        onClose();
      } else {
        throw new Error(response?.data?.message || "Failed to update department");
      }
    } catch (error) {
      console.error("Error updating department:", error);
      toast.error(error.message || "Failed to update department");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-richblack-900 bg-opacity-50">
      <div className="bg-richblack-800 p-8 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-richblack-5">
            Edit Department
          </h2>
          <button
            onClick={onClose}
            className="text-richblack-400 hover:text-richblack-5"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-richblack-5 mb-1">
              Department Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-richblack-5 mb-1">
              Department Code
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-richblack-5 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
              rows="3"
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

export default EditDepartmentModal; 