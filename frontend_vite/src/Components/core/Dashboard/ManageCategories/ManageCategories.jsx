import React, { useState, useEffect } from 'react';
import { createCategory, updateCategory, deleteCategory, getAllCategories } from '../../../../services/operations/serviceProviderAPI';
import { toast } from 'react-hot-toast';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ categoryName: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await getAllCategories();
      setCategories(result);
    } catch (error) {
      console.log("Error fetching categories:", error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!formData.categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(
          editingCategory._id,
          {
            categoryName: formData.categoryName,
            description: formData.description
          }
        );
      } else {
        await createCategory(
          {
            categoryName: formData.categoryName,
            description: formData.description
          }
        );
      }
      
      // Reset form and refresh categories
      setFormData({ categoryName: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.log("Error saving category:", error);
      // Toast messages are handled in the service functions
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      categoryName: category.name,
      description: category.description || ''
    });
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      fetchCategories(); // Refresh the list after deletion
    } catch (error) {
      console.log("Error deleting category:", error);
      // Toast messages are handled in the service function
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ categoryName: '', description: '' });
  };

  return (
    <div className="text-white p-8">
      <h1 className="text-3xl font-medium text-richblack-5 mb-8">Manage Categories</h1>
      
      {/* Form Section */}
      <div className="bg-richblack-800 p-6 rounded-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-richblack-5">
              Category Name<sup className="text-pink-200">*</sup>
            </label>
            <input
              type="text"
              placeholder="Enter Category Name"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              className="form-style w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-richblack-5">Description</label>
            <input
              type="text"
              placeholder="Enter Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-style w-full"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-4">
          <button 
            onClick={handleCreateOrUpdate} 
            className="rounded-md bg-yellow-50 px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
             transition-all duration-200 hover:scale-95 hover:shadow-none disabled:bg-richblack-500"
          >
            {editingCategory ? 'Update Category' : 'Create Category'}
          </button>
          
          {editingCategory && (
            <button 
              onClick={handleCancel}
              className="rounded-md bg-richblack-700 px-6 py-3 text-center text-[13px] font-bold text-richblack-50 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
               transition-all duration-200 hover:scale-95 hover:shadow-none"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="bg-richblack-800 p-6 rounded-lg">
          <h2 className="text-2xl font-medium text-richblack-5 mb-6">All Categories</h2>
          {categories.length === 0 ? (
            <p className="text-richblack-400">No categories found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div 
                  key={category._id} 
                  className="bg-richblack-700 p-4 rounded-lg flex flex-col gap-3"
                >
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  {category.description && (
                    <p className="text-richblack-300 text-sm">{category.description}</p>
                  )}
                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => handleEdit(category)} 
                      className="text-yellow-50 hover:text-yellow-100"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(category._id)} 
                      className="text-pink-200 hover:text-pink-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageCategories;