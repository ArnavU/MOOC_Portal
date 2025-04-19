import React, { useState } from 'react';

const RenameModal = ({ isOpen, onClose, onConfirm, defaultName }) => {
    const [fileName, setFileName] = useState(defaultName);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(fileName);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-richblack-800 p-6 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-richblack-5 mb-4">Download Student List</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-richblack-5 mb-1">
                            File Name
                        </label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded text-richblack-5"
                            placeholder="Enter file name"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-richblack-700 text-richblack-5 rounded hover:bg-richblack-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-yellow-50 text-richblack-900 rounded hover:bg-yellow-25"
                        >
                            Download
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RenameModal; 