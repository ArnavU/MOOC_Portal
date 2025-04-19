import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaUser } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import ValidationErrorModal from '../StudentManagement/ValidationErrorModal';
import EditFacultyModal from './EditFacultyModal';
import { useSelector } from 'react-redux';
import { registerFaculty, getFacultyList } from '../../../../../services/operations/HODAPI';

const FacultyList = () => {
    const { token } = useSelector((state) => state.auth);
    const { department } = useSelector((state) => state.profile.user);
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [errorFacultyName, setErrorFacultyName] = useState('');
    const [newFaculty, setNewFaculty] = useState({
        firstName: '',
        lastName: '',
        email: '',
        designation: '',
        phoneNumber: '',
        password: '',
        profilePhoto: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    // Fetch faculty list on component mount
    useEffect(() => {
        fetchFacultyList();
    }, []);

    const fetchFacultyList = async () => {
        try {
            setLoading(true);
            const facultyList = await getFacultyList(token);
            setFacultyMembers(facultyList);
        } catch (error) {
            console.error("Error fetching faculty list:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewFaculty(prev => ({ ...prev, profilePhoto: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewFaculty(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const newFacultyMember = await registerFaculty(newFaculty);
            if (newFacultyMember) {
                setFacultyMembers(prev => [...prev, newFacultyMember]);
                // Reset form
                setNewFaculty({
                    firstName: '',
                    lastName: '',
                    email: '',
                    designation: '',
                    phoneNumber: '',
                    password: '',
                    profilePhoto: null
                });
                setPreviewImage(null);
            }
        } catch (error) {
            console.error("Error registering faculty:", error);
            if (error.response?.data?.validationErrors && error.response?.data?.validationErrors.length > 0) {
                console.log("Validation Errors:", error.response.data.validationErrors);
                setValidationErrors(error.response.data.validationErrors);
                setErrorFacultyName(`${newFaculty.firstName} ${newFaculty.lastName}`);
                setShowValidationModal(true);
            } else {
                toast.error(error.response?.data?.message || "Failed to register faculty member");
            }
        }
    };

    const handleEdit = (faculty) => {
        setSelectedFaculty(faculty);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (editedFaculty) => {
        setFacultyMembers(prev => 
            prev.map(faculty => 
                faculty._id === editedFaculty._id ? editedFaculty : faculty
            )
        );
        setIsEditModalOpen(false);
        setSelectedFaculty(null);
    };

    const handleDelete = (facultyId) => {
        if (window.confirm('Are you sure you want to delete this faculty member?')) {
            setFacultyMembers(prev => prev.filter(member => member._id !== facultyId));
            toast.success('Faculty member deleted successfully');
        }
    };

    const filteredFaculty = facultyMembers.filter(member => {
        const searchLower = searchTerm.toLowerCase();
        return (
            member.firstName.toLowerCase().includes(searchLower) ||
            member.lastName.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower) ||
            member.additionalDetails?.designation.toLowerCase().includes(searchLower) ||
            member.additionalDetails?.contactNumber.toString().toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-richblack-5">Faculty Management</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Faculty List */}
                <div className="bg-richblack-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4 gap-2">
                        <div >
                            <h2 className="text-xl font-semibold text-richblack-5 leading-none">Faculty Members</h2>
                            <p className="text-richblack-300">{department?.name || 'Loading...'}</p>
                        </div>
                        <input
                            type="text"
                            placeholder="Search faculty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                        />
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {filteredFaculty.map((member) => (
                            <div
                                key={member._id}
                                className="bg-richblack-700 rounded-lg p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full bg-richblack-600 flex items-center justify-center overflow-hidden">
                                        {member.image ? (
                                            <img
                                                src={member.image}
                                                alt={`${member.firstName} ${member.lastName}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FaUser size={24} className="text-richblack-300" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex flex-row gap-2">
                                            <h3 className="text-richblack-5 font-medium">
                                                {member.firstName} {member.lastName}
                                            </h3>
                                            <p className="text-richblack-300">{member.additionalDetails?.designation}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-richblack-300">{member.email}</p>
                                            <p className="text-richblack-300">{member.additionalDetails?.contactNumber}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(member)}
                                        className="text-yellow-50 hover:text-yellow-25"
                                    >
                                        <FaEdit size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member._id)}
                                        className="text-pink-200 hover:text-pink-100"
                                    >
                                        <FaTrash size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Faculty Form */}
                <div className="bg-richblack-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-richblack-5 mb-4">Add New Faculty Member</h2>
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
                                id="profilePhoto"
                            />
                            <label
                                htmlFor="profilePhoto"
                                className="bg-richblack-700 text-richblack-5 px-4 py-2 rounded-md hover:bg-richblack-600 transition-colors duration-200 cursor-pointer"
                            >
                                Upload Photo
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-richblack-5 mb-2">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={newFaculty.firstName}
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
                                    value={newFaculty.lastName}
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
                                value={newFaculty.email}
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
                                value={newFaculty.designation}
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
                                    value={newFaculty.phoneNumber}
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
                                    value={newFaculty.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                                    required
                                    minLength={6}
                                    placeholder="Enter password (min 6 characters)"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-yellow-50 text-richblack-900 px-4 py-2 rounded-md hover:bg-yellow-25 transition-all duration-200"
                        >
                            Add Faculty Member
                        </button>
                    </form>
                </div>                
            </div>

            {/* Edit Faculty Modal */}
            <EditFacultyModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedFaculty(null);
                }}
                faculty={selectedFaculty}
                onSave={handleSaveEdit}
            />

            <ValidationErrorModal
                isOpen={showValidationModal}
                onClose={() => setShowValidationModal(false)}
                errors={validationErrors}
                facultyName={errorFacultyName}
            />
        </div>
    );
};

export default FacultyList;