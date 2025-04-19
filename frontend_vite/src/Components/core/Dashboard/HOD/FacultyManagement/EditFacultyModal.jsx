import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser } from 'react-icons/fa';
import { editFaculty } from '../../../../../services/operations/HODAPI';
import ValidationErrorModal from '../StudentManagement/ValidationErrorModal';
import { toast } from 'react-hot-toast';

const EditFacultyModal = ({ isOpen, onClose, faculty, onSave }) => {
    const [editedFaculty, setEditedFaculty] = useState({
        facultyId: '',
        firstName: '',
        lastName: '',
        email: '',
        designation: '',
        phoneNumber: '',
        password: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [errorFacultyName, setErrorFacultyName] = useState('');

    useEffect(() => {
        if (faculty) {
            setEditedFaculty({
                facultyId: faculty._id,
                firstName: faculty.firstName,
                lastName: faculty.lastName,
                email: faculty.email,
                designation: faculty.additionalDetails?.designation || '',
                phoneNumber: faculty.additionalDetails?.contactNumber || '',
                password: '',
                image: faculty.image
            });
            setPreviewImage(faculty.image || null);
        }
    }, [faculty]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditedFaculty(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedFaculty(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await editFaculty(editedFaculty);
            if (result) {
                onSave(result);
                onClose();
            }
        } catch (error) {
            if (error.response?.data?.validationErrors) {
                setValidationErrors(error.response.data.validationErrors);
                setErrorFacultyName(`${editedFaculty.firstName} ${editedFaculty.lastName}`);
                setShowValidationModal(true);
            } else {
                toast.error(error.response?.data?.message || "Failed to update faculty details");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-richblack-800 rounded-lg p-6 max-w-2xl w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-richblack-5">
                            Edit Faculty Member
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-richblack-5 hover:text-yellow-50 transition-colors duration-200"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-32 h-32 rounded-full bg-richblack-700 flex items-center justify-center overflow-hidden mb-4">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <FaUser size={48} className="text-richblack-300" />
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="editProfilePhoto"
                            />
                            <label
                                htmlFor="editProfilePhoto"
                                className="bg-richblack-700 text-richblack-5 px-4 py-2 rounded-md hover:bg-richblack-600 transition-colors duration-200 cursor-pointer"
                            >
                                Change Photo
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-richblack-5 mb-2">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={editedFaculty.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-richblack-5 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={editedFaculty.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-richblack-5 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={editedFaculty.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-richblack-5 mb-2">Designation</label>
                            <input
                                type="text"
                                name="designation"
                                value={editedFaculty.designation}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-richblack-5 mb-2">Contact Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={editedFaculty.phoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-richblack-5 mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={editedFaculty.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-richblack-700 text-richblack-5 px-4 py-2 rounded-md hover:bg-richblack-600 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-md hover:bg-yellow-25 transition-all duration-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ValidationErrorModal
                isOpen={showValidationModal}
                onClose={() => setShowValidationModal(false)}
                errors={validationErrors}
                studentName={errorFacultyName}
            />
        </>
    );
};

export default EditFacultyModal; 