import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { registerStudents } from "../../../../../services/operations/HODAPI";
import { toast } from "react-hot-toast";
import ErrorModal from "./ErrorModal";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const AddStudentModal = ({ isOpen, onClose, onAddStudent }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.profile);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [apiErrors, setApiErrors] = useState({ validationErrors: [], errorMessages: [] });
    const [isBulkUpload, setIsBulkUpload] = useState(false);
    const [fileData, setFileData] = useState(null);
    const [fileName, setFileName] = useState("");
    const [fileError, setFileError] = useState("");
    const [previewData, setPreviewData] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef(null);

    // Required columns for student data
    const requiredColumns = [
        "firstName", "lastName", "email", "rollNumber", 
        "prn", "batch", "currentYear", "semester", "contactNumber"
    ];

    const validateFileData = (data) => {
        // Check if data is empty
        if (!data || data.length === 0) {
            return "File contains no data";
        }

        // Check if all required columns are present
        const headers = Object.keys(data[0]);
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
            return `Missing required columns: ${missingColumns.join(", ")}`;
        }

        // Check for empty values in required fields
        const rowsWithEmptyValues = [];
        data.forEach((row, index) => {
            requiredColumns.forEach(col => {
                if (!row[col] || String(row[col]).trim() === "") {
                    rowsWithEmptyValues.push(index + 1);
                }
            });
        });

        if (rowsWithEmptyValues.length > 0) {
            // Get unique row numbers
            const uniqueRows = [...new Set(rowsWithEmptyValues)];
            return `Empty values found in required fields in rows: ${uniqueRows.join(", ")}`;
        }

        return null;
    };

    const processFile = (file) => {
        setFileError("");
        
        if (!file) {
            setFileData(null);
            setFileName("");
            setShowPreview(false);
            return;
        }

        setFileName(file.name);
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (fileExtension === 'csv') {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data && results.data.length > 0) {
                        const error = validateFileData(results.data);
                        if (error) {
                            setFileError(error);
                            setFileData(null);
                            setShowPreview(false);
                        } else {
                            setFileData(results.data);
                            setPreviewData(results.data.slice(0, 5)); // Preview first 5 rows
                            setShowPreview(true);
                        }
                    } else {
                        setFileError("File contains no data");
                        setFileData(null);
                        setShowPreview(false);
                    }
                },
                error: (err) => {
                    setFileError(`Error parsing CSV: ${err}`);
                    setFileData(null);
                    setShowPreview(false);
                }
            });
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const parsedData = XLSX.utils.sheet_to_json(worksheet);
                    
                    if (parsedData && parsedData.length > 0) {
                        const error = validateFileData(parsedData);
                        if (error) {
                            setFileError(error);
                            setFileData(null);
                            setShowPreview(false);
                        } else {
                            setFileData(parsedData);
                            setPreviewData(parsedData.slice(0, 5)); // Preview first 5 rows
                            setShowPreview(true);
                        }
                    } else {
                        setFileError("File contains no data");
                        setFileData(null);
                        setShowPreview(false);
                    }
                } catch (error) {
                    setFileError(`Error parsing Excel file: ${error.message}`);
                    setFileData(null);
                    setShowPreview(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            setFileError("Unsupported file format. Please upload a CSV or Excel file.");
            setFileData(null);
            setShowPreview(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleToggleMode = () => {
        setIsBulkUpload(!isBulkUpload);
        setFileData(null);
        setFileName("");
        setFileError("");
        setShowPreview(false);
        reset();
    };

    const downloadTemplate = () => {
        // Create a template with header row
        const headers = requiredColumns;
        
        // Create CSV content
        const csvContent = [
            headers.join(','), // Header row
            // Add an example row
            'John,Doe,john.doe@example.com,12345,PRN12345,2023-27,SY,3,1234567890' 
        ].join('\n');
        
        // Create a blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'student_template.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Handle single student submission
    const handleSingleSubmit = async (data) => {
        try {
            setLoading(true);
            const studentData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                rollNumber: data.rollNumber,
                prn: data.prn,
                batch: data.batch,
                currentYear: data.currentYear,
                semester: data.semester,
                contactNumber: data.contactNumber,
                department: user.department.name,
            };

            const response = await registerStudents([studentData]);
            console.log("Registration Response: ", response);
            toast.success("Student registered successfully");
            reset();
            onClose();
            if (onAddStudent) {
                onAddStudent();
            }
        } catch (error) {
            console.error("Error registering student:", error);
            
            // Extract specific error details
            let errorMessage = "Failed to register student";
            
            if (error.response?.data) {
                // Check for specific error types
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                
                // Check for specific field errors
                if (error.response.data.validationErrors && error.response.data.validationErrors.length > 0) {
                    const firstError = error.response.data.validationErrors[0];
                    errorMessage = `${errorMessage}: ${firstError.field} - ${firstError.message}`;
                    
                    // Set full errors for the modal
                    setApiErrors({
                        validationErrors: error.response.data.validationErrors || [],
                        errorMessages: error.response.data.errorMessages || []
                    });
                    setShowErrorModal(true);
                }
                
                // Check for network-related errors
                if (error.response.status === 401) {
                    errorMessage = "Authentication failed. Please log in again.";
                } else if (error.response.status === 403) {
                    errorMessage = "You don't have permission to register students.";
                } else if (error.response.status >= 500) {
                    errorMessage = "Server error. Please try again later.";
                }
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = "No response from server. Please check your connection.";
            } else {
                // Error in setting up the request
                errorMessage = `Request error: ${error.message}`;
            }
            
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle bulk upload submission
    const handleBulkSubmit = async () => {
        if (!fileData) {
            toast.error("No valid file data to upload");
            return;
        }
        
        try {
            setLoading(true);
            
            // Add department to each student record
            const enrichedData = fileData.map(student => ({
                ...student,
                department: user.department.name
            }));
            
            const response = await registerStudents(enrichedData);
            console.log("Bulk Registration Response: ", response);
            toast.success(`Successfully registered ${enrichedData.length} students`);
            setFileData(null);
            setFileName("");
            setShowPreview(false);
            onClose();
            if (onAddStudent) {
                onAddStudent();
            }
        } catch (error) {
            console.error("Error registering students:", error);
            
            // Extract detailed error information for bulk uploads
            let errorMessage = "Failed to register students";
            
            if (error.response?.data) {
                // Primary error message
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                
                // Validation errors for specific students/fields
                if (error.response.data.validationErrors && error.response.data.validationErrors.length > 0) {
                    // Count errors by type for a more useful summary
                    const errorCount = error.response.data.validationErrors.length;
                    const uniqueFields = new Set(error.response.data.validationErrors.map(err => err.field));
                    
                    if (uniqueFields.size === 1) {
                        // If all errors are for the same field
                        errorMessage = `${errorMessage}: ${errorCount} errors with ${[...uniqueFields][0]}`;
                    } else {
                        // Multiple fields have issues
                        errorMessage = `${errorMessage}: ${errorCount} errors across ${uniqueFields.size} fields`;
                    }
                    
                    // Show more details in the modal
                    setApiErrors({
                        validationErrors: error.response.data.validationErrors || [],
                        errorMessages: error.response.data.errorMessages || []
                    });
                    setShowErrorModal(true);
                }
                
                // Network/server errors
                if (error.response.status === 401) {
                    errorMessage = "Authentication failed. Please log in again.";
                } else if (error.response.status === 403) {
                    errorMessage = "You don't have permission to register students.";
                } else if (error.response.status === 413) {
                    errorMessage = "File too large. Please reduce the number of records.";
                } else if (error.response.status >= 500) {
                    errorMessage = "Server error. Please try again later.";
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "No response from server. Please check your connection.";
            } else {
                // Something happened in setting up the request
                errorMessage = `Request error: ${error.message}`;
            }
            
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-richblack-800 p-6 rounded-lg w-full max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-richblack-5">
                            {isBulkUpload ? "Bulk Add Students" : "Add New Student"}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-richblack-300">Single</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={isBulkUpload} 
                                    onChange={handleToggleMode}
                                />
                                <div className="w-11 h-6 bg-richblack-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-yellow-50 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-50"></div>
                            </label>
                            <span className="text-sm text-richblack-300">Bulk</span>
                        </div>
                    </div>

                    {isBulkUpload ? (
                        <div className="space-y-4">
                            <div className="bg-richblack-700 p-4 rounded-lg border border-richblack-600">
                                <p className="text-sm text-richblack-100 mb-2">
                                    Upload a CSV or Excel file with student details. Make sure it includes all required columns.
                                </p>
                                <button
                                    type="button"
                                    onClick={downloadTemplate}
                                    className="text-sm text-yellow-50 hover:underline mb-4"
                                >
                                    Download CSV Template
                                </button>
                                
                                <div 
                                    className="border-2 border-dashed border-richblack-500 rounded-lg p-6 text-center"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={triggerFileInput}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        ref={fileInputRef}
                                        accept=".csv, .xlsx, .xls"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="flex flex-col items-center justify-center cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-richblack-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-richblack-100 font-medium mb-1">Click to upload or drag and drop</span>
                                        <span className="text-xs text-richblack-300">CSV, Excel (.xlsx, .xls)</span>
                                    </div>
                                </div>

                                {fileName && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm text-richblack-100">{fileName}</span>
                                    </div>
                                )}

                                {fileError && (
                                    <div className="mt-2 text-sm text-pink-200">
                                        {fileError}
                                    </div>
                                )}

                                {showPreview && previewData.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium text-richblack-100 mb-2">Preview (First 5 rows):</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-richblack-600 text-xs">
                                                <thead>
                                                    <tr>
                                                        {Object.keys(previewData[0]).map((header, index) => (
                                                            <th key={index} className="px-2 py-1 text-left text-richblack-300">
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-richblack-600">
                                                    {previewData.map((row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            {Object.values(row).map((cell, cellIndex) => (
                                                                <td key={cellIndex} className="px-2 py-1 text-richblack-100">
                                                                    {cell?.toString() || ""}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs text-richblack-300 mt-1">
                                            Total records: {fileData ? fileData.length : 0}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-richblack-700 text-richblack-5 rounded hover:bg-richblack-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button" 
                                    onClick={handleBulkSubmit}
                                    disabled={loading || !fileData}
                                    className={`px-4 py-2 rounded ${fileData ? 'bg-yellow-50 text-richblack-900 hover:bg-yellow-25' : 'bg-richblack-500 text-richblack-300'} disabled:opacity-50`}
                                >
                                    {loading ? "Uploading..." : "Upload Students"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(handleSingleSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-richblack-5 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        {...register("firstName", { required: "First name is required" })}
                                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                    />
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-pink-200">{errors.firstName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-richblack-5 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        {...register("lastName", { required: "Last name is required" })}
                                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                    />
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-pink-200">{errors.lastName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-richblack-5 mb-1">Email</label>
                                    <input
                                        type="email"
                                        {...register("email", { 
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address"
                                            }
                                        })}
                                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-pink-200">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-richblack-5 mb-1">Roll Number</label>
                                    <input
                                        type="text"
                                        {...register("rollNumber", { required: "Roll number is required" })}
                                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                    />
                                    {errors.rollNumber && (
                                        <p className="mt-1 text-sm text-pink-200">{errors.rollNumber.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-richblack-5 mb-1">PRN</label>
                                    <input
                                        type="text"
                                        {...register("prn", { required: "PRN is required" })}
                                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                    />
                                    {errors.prn && (
                                        <p className="mt-1 text-sm text-pink-200">{errors.prn.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-richblack-5 mb-1">Batch</label>
                                    <input
                                        type="text"
                                        {...register("batch", { required: "Batch is required" })}
                                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                    />
                                    {errors.batch && (
                                        <p className="mt-1 text-sm text-pink-200">{errors.batch.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-richblack-5 mb-1">Current Year</label>
                                    <select
                                        {...register("currentYear", { required: "Current year is required" })}
                                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="FY">FY</option>
                                        <option value="SY">SY</option>
                                        <option value="TY">TY</option>
                                        <option value="BTech">BTech</option>
                                    </select>
                                    {errors.currentYear && (
                                        <p className="mt-1 text-sm text-pink-200">{errors.currentYear.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-richblack-5 mb-1">Semester</label>
                                    <select
                                        {...register("semester", { required: "Semester is required" })}
                                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                    >
                                        <option value="">Select Semester</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                    </select>
                                    {errors.semester && (
                                        <p className="mt-1 text-sm text-pink-200">{errors.semester.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-richblack-5 mb-1">Contact Number</label>
                                    <input
                                        type="tel"
                                        {...register("contactNumber", { 
                                            required: "Contact number is required",
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: "Contact number must be 10 digits"
                                            }
                                        })}
                                        className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                                    />
                                    {errors.contactNumber && (
                                        <p className="mt-1 text-sm text-pink-200">{errors.contactNumber.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-richblack-5 mb-1">Department</label>
                                    <div className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5 opacity-75 cursor-not-allowed">
                                        {user?.department?.name || "Loading..."}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-richblack-700 text-richblack-5 rounded hover:bg-richblack-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-yellow-50 text-richblack-900 rounded hover:bg-yellow-25 disabled:opacity-50"
                                >
                                    {loading ? "Adding..." : "Add Student"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Enhanced Error Modal with better error display */}
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                validationErrors={apiErrors.validationErrors}
                errorMessages={apiErrors.errorMessages}
                title={isBulkUpload ? "Bulk Upload Errors" : "Student Registration Error"}
            />
        </>
    );
};

export default AddStudentModal;