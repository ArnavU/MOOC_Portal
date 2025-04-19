import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ValidationErrorModal = ({ isOpen, onClose, errors, studentName, facultyName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-richblack-800 rounded-lg p-6 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-richblack-5">
                        Validation Errors for {studentName || facultyName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-richblack-5 hover:text-yellow-50 transition-colors duration-200"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {errors.map((error, index) => (
                        <div
                            key={index}
                            className="bg-pink-900/50 border border-pink-500 rounded-md p-4 text-richblack-5"
                        >
                            {error.error && <p className="font-medium">{error.error}</p>}   
                            {error.field && <p className="font-medium">{error?.field}: {error?.message}</p>}
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-richblack-700 text-richblack-5 px-4 py-2 rounded-md hover:bg-richblack-600 transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValidationErrorModal; 