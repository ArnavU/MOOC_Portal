import React, { useEffect, useState } from "react";
import { getAllDepartments } from "../../../../../services/operations/instituteAdminAPI";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditDepartmentModal from "./EditDepartmentModal";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

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
  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = () => {
    navigate("/dashboard/institute-admin/create-department");
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    fetchDepartments();
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
        <h1 className="text-2xl font-bold text-richblack-5">Departments</h1>
        <button
          onClick={handleCreateDepartment}
          className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-md font-medium hover:bg-yellow-25 transition-all duration-200"
        >
          Create Department
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="text-center py-16 px-8 bg-richblack-800 rounded-lg">
          <h2 className="text-xl font-semibold text-richblack-5 mb-4">
            No Departments Created Yet
          </h2>
          <p className="text-richblack-200 mb-8">
            Start by creating your first department to manage courses and HODs.
          </p>
          <button
            onClick={handleCreateDepartment}
            className="bg-yellow-50 text-richblack-900 px-6 py-2 rounded-md font-medium hover:bg-yellow-25 transition-all duration-200"
          >
            Create Your First Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <div
              key={department._id}
              className="bg-richblack-800 p-6 rounded-lg shadow-lg"
            >
              <h2 className="text-xl font-semibold text-richblack-5 mb-2">
                {department.name}
              </h2>
              <p className="text-richblack-200 mb-2">
                <span className="font-medium text-richblack-5">Code:</span>{" "}
                {department.code}
              </p>
              {department.description && (
                <p className="text-richblack-200 mb-4">
                  <span className="font-medium text-richblack-5">Description:</span>{" "}
                  {department.description}
                </p>
              )}
              <div className="mb-4">
                <span className="font-medium text-richblack-5">HOD:</span>{" "}
                {department.hod ? (
                  <span className="text-richblack-200">
                    {`${department.hod.firstName} ${department.hod.lastName}`}
                  </span>
                ) : (
                  <span className="text-pink-200 italic">Not assigned</span>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => handleEditDepartment(department)}
                  className="flex items-center gap-2 text-yellow-50 hover:text-yellow-25 transition-all duration-200"
                >
                  <FaEdit className="text-lg" />
                  <span>Edit</span>
                </button>
                <button
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

      <EditDepartmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        department={selectedDepartment}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default DepartmentList;
