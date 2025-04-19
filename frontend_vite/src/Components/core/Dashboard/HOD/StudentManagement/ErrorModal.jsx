import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorModal = ({ isOpen, onClose, validationErrors, errorMessages }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-richblack-800 p-6 rounded-lg w-full max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <FaExclamationTriangle className="text-yellow-50 text-xl" />
                    <h2 className="text-2xl font-bold text-richblack-5">Registration Errors</h2>
                </div>

                {validationErrors && validationErrors.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-richblack-5 mb-2">Validation Errors</h3>
                        <div className="space-y-2">
                            {validationErrors.map((error, index) => (
                                <div key={index} className="bg-richblack-700 p-3 rounded">
                                    <p className="text-richblack-5 font-medium">
                                        {error.student ? `Student: ${error.student}` : 'Unknown Student'}
                                    </p>
                                    <p className="text-pink-200">{error.error}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {errorMessages && errorMessages.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-richblack-5 mb-2">Error Messages</h3>
                        <div className="space-y-2">
                            {errorMessages.map((message, index) => (
                                <div key={index} className="bg-richblack-700 p-3 rounded">
                                    <p className="text-pink-200">{message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-richblack-700 text-richblack-5 rounded hover:bg-richblack-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorModal; 