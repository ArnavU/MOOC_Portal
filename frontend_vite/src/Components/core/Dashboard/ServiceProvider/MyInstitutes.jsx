import React, { useEffect, useState } from "react";
import { getAllInstitutes } from "../../../services/operations/serviceProviderAPI";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const MyInstitutes = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await getAllInstitutes();
        setInstitutes(response.data);
      } catch (error) {
        toast.error("Failed to fetch institutes");
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutes();
  }, []);

  const handleCreateInstitute = () => {
    navigate("/dashboard/create-institute");
  };

  const handleEditInstitute = (instituteId) => {
    navigate(`/dashboard/edit-institute/${instituteId}`);
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl min-w-[70%] mx-auto">
      <div className="flex justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-richblack-5">My Institutes</h1>
        <button
          onClick={handleCreateInstitute}
          className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-md font-medium hover:bg-yellow-25 transition-all duration-200"
        >
          Create Institute
        </button>
      </div>

      {institutes.length === 0 ? (
        <div className="text-center py-16 px-8 bg-richblack-800 rounded-lg">
          <h2 className="text-xl font-semibold text-richblack-5 mb-4">
            No Institutes Created Yet
          </h2>
          <p className="text-richblack-200 mb-8">
            Start by creating your first institute to manage courses and departments.
          </p>
          <button
            onClick={handleCreateInstitute}
            className="bg-yellow-50 text-richblack-900 px-6 py-2 rounded-md font-medium hover:bg-yellow-25 transition-all duration-200"
          >
            Create Your First Institute
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutes.map((institute) => (
            <div
              key={institute._id}
              className="bg-richblack-800 p-6 rounded-lg shadow-lg"
            >
              <h2 className="text-xl font-semibold text-richblack-5 mb-2">
                {institute.name}
              </h2>
              <p className="text-richblack-200 mb-4">{institute.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-richblack-300">
                  {institute.departments?.length || 0} Departments
                </span>
                <button
                  onClick={() => handleEditInstitute(institute._id)}
                  className="text-yellow-50 hover:text-yellow-25 transition-all duration-200"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInstitutes; 