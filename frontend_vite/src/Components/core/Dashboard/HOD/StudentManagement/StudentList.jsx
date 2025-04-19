import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import AddStudentModal from './AddStudentModal';
import RenameModal from './RenameModal';
import ValidationErrorModal from './ValidationErrorModal';
import { useSelector } from "react-redux";
import { getDepartmentStudents, updateStudent } from "../../../../../services/operations/HODAPI";
import * as XLSX from 'xlsx';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [errorStudentName, setErrorStudentName] = useState('');
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        console.log("Fetching Students");
        try {
            setLoading(true);
            const response = await getDepartmentStudents();
            console.log("Response:", response);
            if (response.success) {
                setStudents(response.data);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    const tableColumns = [
        { key: 'index', label: '#', width: 'w-10', sortable: false },
        { key: 'prn', label: 'PRN', width: 'w-28', sortable: true, render: (student) => student.additionalDetails.prn },
        { key: 'rollNumber', label: 'Roll No.', width: 'w-24', sortable: true, render: (student) => student.additionalDetails.rollNumber },
        { key: 'name', label: 'Name', width: 'w-36', sortable: true, render: (student) => `${student.firstName} ${student.lastName}` },
        { key: 'email', label: 'Email', width: 'w-40', sortable: true },
        { key: 'batch', label: 'Batch', width: 'w-20', sortable: true, render: (student) => student.additionalDetails.batch },
        { key: 'year', label: 'Year', width: 'w-16', sortable: true, render: (student) => student.additionalDetails.year },
        { key: 'semester', label: 'Sem', width: 'w-16', sortable: true, render: (student) => student.additionalDetails.semester },
        { key: 'department', label: 'Department', width: 'w-32', sortable: true, render: (student) => student.department?.name || 'N/A' },
        { key: 'contactNumber', label: 'Contact', width: 'w-24', sortable: true, render: (student) => student.additionalDetails.contactNumber },
    ];

    // Filter students based on search term
    const filteredStudents = students.filter(student => {
        const searchLower = searchTerm.toLowerCase();
        return (
            student?.firstName?.toLowerCase().includes(searchLower) ||
            student?.lastName?.toLowerCase().includes(searchLower) ||
            student?.email?.toLowerCase().includes(searchLower) ||
            student?.rollNumber?.toLowerCase().includes(searchLower) 
        );
    });

    // Sort students
    const sortedStudents = React.useMemo(() => {
        if (!sortConfig.key) return students;

        return [...students].sort((a, b) => {
            // Special handling for year field
            if (sortConfig.key === 'currentYear') {
                const yearOrder = { 'FY': 1, 'SY': 2, 'TY': 3, 'BTech': 4 };
                const aValue = yearOrder[a[sortConfig.key]] || 0;
                const bValue = yearOrder[b[sortConfig.key]] || 0;
                return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
            }

            // Default sorting for other fields
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [students, sortConfig]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectStudent = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(student => student._id));
        }
    };

    const handleDelete = (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            setStudents(students.filter(student => student._id !== studentId));
            toast.success('Student deleted successfully');
        }
    };

    const handleBulkDelete = () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select students to delete');
            return;
        }
        if (window.confirm(`Are you sure you want to delete ${selectedStudents.length} students?`)) {
            setStudents(students.filter(student => !selectedStudents.includes(student._id)));
            setSelectedStudents([]);
            toast.success(`${selectedStudents.length} students deleted successfully`);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent({ ...student });
    };

    const handleSaveEdit = async () => {
        try {
            // Prepare the student data in the format expected by the server
            const studentData = {
                students: [{
                    studentId: editingStudent._id,
                    firstName: editingStudent.firstName,
                    lastName: editingStudent.lastName,
                    email: editingStudent.email,
                    prn: editingStudent.additionalDetails.prn,
                    rollNumber: editingStudent.additionalDetails.rollNumber,
                    batch: editingStudent.additionalDetails.batch,
                    year: editingStudent.additionalDetails.year,
                    semester: editingStudent.additionalDetails.semester,
                    contactNumber: editingStudent.additionalDetails.contactNumber
                }]
            };

            try {
                const response = await updateStudent(editingStudent._id, studentData);
                if (response.data.success) {
                    // Update the local state with the updated student data
                    setStudents(students.map(student => 
                        student._id === editingStudent._id ? response.data.data[0] : student
                    ));
                    setEditingStudent(null);
                    toast.success('Student updated successfully');
                }
            } catch (error) {
                if (error.response?.data?.validationErrors?.length > 0) {
                    setValidationErrors(error.response.data.validationErrors);
                    setErrorStudentName(`${editingStudent.firstName} ${editingStudent.lastName}`);
                    setShowValidationModal(true);
                } else if (error.response?.data?.errorMessages?.length > 0) {
                    setValidationErrors(error.response.data.errorMessages);
                    setErrorStudentName(`${editingStudent.firstName} ${editingStudent.lastName}`);
                    setShowValidationModal(true);
                } else {
                    toast.error(error.response?.data?.message || 'Failed to update student');
                }
            }
        } catch (error) {
            console.error("Error updating student:", error);
            toast.error(error.message || 'Failed to update student');
        }
    };

    const handleCancelEdit = () => {
        setEditingStudent(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingStudent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddStudent = async () => {
        // Refresh the student list after adding a new student
        try {
            await fetchStudents();
        } catch (error) {
            console.error("Error refreshing student list:", error);
            toast.error("Failed to refresh student list");
        }
    };

    const handleDownloadExcel = (fileName) => {
        try {
            // Prepare data for Excel
            const excelData = students.map(student => ({
                'PRN': student.additionalDetails.prn,
                'Roll Number': student.additionalDetails.rollNumber,
                'Name': `${student.firstName} ${student.lastName}`,
                'Email': student.email,
                'Batch': student.additionalDetails.batch,
                'Year': student.additionalDetails.year,
                'Semester': student.additionalDetails.semester,
                'Department': student.department?.name || 'N/A',
                'Contact Number': student.additionalDetails.contactNumber
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, "Students");

            // Generate Excel file
            XLSX.writeFile(wb, `${fileName}.xlsx`);

            toast.success("Student list downloaded successfully");
        } catch (error) {
            console.error("Error downloading Excel:", error);
            toast.error("Failed to download student list");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-richblack-5"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-richblack-5">Student Management</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-md hover:bg-yellow-25 transition-all duration-200 flex items-center gap-2"
                    >
                        <FaPlus /> Add Student
                    </button>
                    <button
                        onClick={() => setShowRenameModal(true)}
                        className="bg-richblack-700 text-richblack-5 px-4 py-2 rounded-md hover:bg-richblack-600 transition-all duration-200 flex items-center gap-2"
                    >
                        <FaDownload /> Download List
                    </button>
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`px-4 py-2 rounded-md transition-all duration-200 ${
                            isEditMode
                                ? "bg-richblack-700 text-richblack-5"
                                : "bg-richblack-800 text-richblack-5"
                        }`}
                    >
                        {isEditMode ? "Exit Selection" : "Select Multiple"}
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5"
                />
            </div>

            {isEditMode && selectedStudents.length > 0 && (
                <div className="mb-4">
                    <button
                        onClick={handleBulkDelete}
                        className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-all duration-200"
                    >
                        Delete Selected ({selectedStudents.length})
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="bg-richblack-700 text-richblack-5">
                            {isEditMode && (
                                <th className="w-12 px-2 py-2">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedStudents.length === students.length}
                                        className="rounded"
                                    />
                                </th>
                            )}
                            {tableColumns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`${column.width} px-2 py-2 text-left ${
                                        column.sortable ? 'cursor-pointer hover:bg-richblack-600' : ''
                                    }`}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    {column.label}
                                    {column.sortable && sortConfig.key === column.key && (
                                        sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                                    )}
                                </th>
                            ))}
                            {!isEditMode && <th className="w-20 px-2 py-2 text-left">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStudents.map((student, index) => (
                            <tr key={student._id} className="border-b border-richblack-700">
                                {isEditMode && (
                                    <td className="px-2 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student._id)}
                                            onChange={() => handleSelectStudent(student._id)}
                                            className="rounded"
                                        />
                                    </td>
                                )}
                                {tableColumns.map((column) => (
                                    <td key={column.key} className="px-2 py-2 text-richblack-5">
                                        {editingStudent?._id === student._id && column.key !== 'index' ? (
                                            column.key === 'name' ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={editingStudent.firstName}
                                                        onChange={handleInputChange}
                                                        className="w-1/2 px-2 py-1 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                                    />
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={editingStudent.lastName}
                                                        onChange={handleInputChange}
                                                        className="w-1/2 px-2 py-1 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                                    />
                                                </div>
                                            ) : column.key === 'department' ? (
                                                <input
                                                    type="text"
                                                    name="department"
                                                    value={editingStudent.department?.name || ''}
                                                    onChange={(e) => {
                                                        setEditingStudent(prev => ({
                                                            ...prev,
                                                            department: { name: e.target.value }
                                                        }));
                                                    }}
                                                    className="w-full px-2 py-1 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                                />
                                            ) : ["prn", "rollNumber", "batch", "year", "semester", "contactNumber"].includes(column.key) ? (
                                                <input
                                                    type="text"
                                                    name={column.key}
                                                    value={editingStudent.additionalDetails[column.key]}
                                                    onChange={(e) => {
                                                        setEditingStudent(prev => ({
                                                            ...prev,
                                                            additionalDetails: { ...prev.additionalDetails, [column.key]: e.target.value }
                                                        }));
                                                    }}
                                                    className="w-full px-2 py-1 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                                />
                                            ) : (
                                                <input
                                                    type={column.key === 'email' ? 'email' : 'text'}
                                                    name={column.key}
                                                    value={editingStudent[column.key]}
                                                    onChange={handleInputChange}
                                                    className="w-full px-2 py-1 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                                />
                                            )
                                        ) : (
                                            <div className={`${column.key === 'prn' ? '' : 'truncate'}`} title={column.render ? column.render(student) : student[column.key]}>
                                                {column.key === 'index' ? index + 1 : (column.render ? column.render(student) : student[column.key])}
                                            </div>
                                        )}
                                    </td>
                                ))}
                                {!isEditMode && (
                                    <td className="px-2 py-2">
                                        {editingStudent?._id === student._id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-all duration-200"
                                                >
                                                    <FaSave size={20} />
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all duration-200"
                                                >
                                                    <FaTimes size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="text-yellow-50 hover:text-yellow-25"
                                                >
                                                    <FaEdit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student._id)}
                                                    className="text-pink-200 hover:text-pink-100"
                                                >
                                                    <FaTrash size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddStudentModal 
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAddStudent={handleAddStudent}
            />

            <RenameModal
                isOpen={showRenameModal}
                onClose={() => setShowRenameModal(false)}
                onConfirm={(fileName) => {
                    handleDownloadExcel(fileName);
                    setShowRenameModal(false);
                }}
                defaultName={`${user?.department?.name}_Students_${new Date().toISOString().split('T')[0]}`}
            />

            {/* Validation Error Modal for Update Student */}
            <ValidationErrorModal
                isOpen={showValidationModal}
                onClose={() => setShowValidationModal(false)}
                errors={validationErrors}
                studentName={errorStudentName}
            />
        </div>
    );
};

export default StudentList; 