import React, { useState, useEffect } from 'react';
import { FiChevronRight, FiSearch, FiCheck, FiX, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { fetchApprovedInstructorCourses } from '../../../../services/operations/courseDetailsAPI';
import { fetchDepartmentStudents, allocateCourseToStudents } from '../../../../services/operations/instructorAPI';

const CourseAssignmentWizard = ({ onBack }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [allocationError, setAllocationError] = useState(null);
    const [allocationSuccess, setAllocationSuccess] = useState(false);
    const [showAllocationModal, setShowAllocationModal] = useState(false);
    const [allocationResults, setAllocationResults] = useState(null);

    const years = ["FY", "SY", "TY", "BTech"];
    const semesters = ["1", "2", "3"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [approvedCourses, departmentStudents] = await Promise.all([
                    fetchApprovedInstructorCourses(),
                    fetchDepartmentStudents()
                ]);
                setCourses(approvedCourses);
                setStudents(departmentStudents?.students || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredStudents = students.filter(student => {
        const matchesSearch = 
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.prn.includes(searchQuery) ||
            student.rollNumber.toString().includes(searchQuery);
        const matchesYear = !selectedYear || student.year === selectedYear;
        const matchesSemester = !selectedSemester || student.semester === selectedSemester;
        return matchesSearch && matchesYear && matchesSemester;
    });

    // Add helper function to check if student has the course
    const hasCourseAllocated = (student) => {
        if (!selectedCourse) return false;
        return student.courses?.some(course => 
            course.courseId === selectedCourse._id
        );
    };

    const handleStudentSelect = (student) => {
        // Don't allow selection if student already has the course
        if (hasCourseAllocated(student)) {
            toast.error("This student is already enrolled in the selected course");
            return;
        }
        setSelectedStudents(prev => {
            if (prev.some(s => s.prn === student.prn)) {
                return prev.filter(s => s.prn !== student.prn);
            }
            return [...prev, student];
        });
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents);
        }
    };

    const handleAllocateCourse = async () => {
        if (currentStep === 1 && !selectedCourse) {
            setAllocationError({
                type: "validation",
                message: "Please select a course to proceed"
            });
            return;
        }

        if (currentStep === 2 && selectedStudents.length === 0) {
            setAllocationError({
                type: "validation",
                message: "Please select at least one student to proceed"
            });
            return;
        }

        setAllocationError(null);
        setAllocationSuccess(false);

        try {
            const studentIds = selectedStudents.map(student => student._id);
            const response = await allocateCourseToStudents(studentIds, selectedCourse._id);
            // Set allocation results and show modal
            setAllocationResults(response.data);
            setShowAllocationModal(true);
            
        } catch (error) {
            // Handle specific error cases from backend
            let errorType = "general";
            let errorMessage = error.message || "Failed to allocate course";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
                
                if (errorMessage.includes("not authorized")) {
                    errorType = "authorization";
                } else if (errorMessage.includes("unapproved course")) {
                    errorType = "validation";
                } else if (errorMessage.includes("not found")) {
                    errorType = "not_found";
                }
            }

            setAllocationError({
                type: errorType,
                message: errorMessage
            });
        }
    };

    const handleModalClose = () => {
        setShowAllocationModal(false);
        // Reset all selections
        setSelectedCourse(null);
        setSelectedStudents([]);
        setSearchQuery("");
        setSelectedYear("");
        setSelectedSemester("");
        // Go back to allocations
        onBack();
    };

    const handleNext = () => {
        if (currentStep === 1 && !selectedCourse) {
            setAllocationError({
                type: "validation",
                message: "Please select a course to proceed"
            });
            return;
        }

        if (currentStep === 3 && selectedStudents.length === 0) {
            setAllocationError({
                type: "validation",
                message: "Please select at least one student to proceed"
            });
            return;
        }

        setAllocationError(null);
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if(currentStep === 1){
            onBack();
        }
        else{
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 flex flex-col items-center justify-center">
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-richblack-300 hover:text-richblack-5 transition-colors"
                >
                    <FiArrowLeft className="text-lg" />
                    Back to Allocations
                </button>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-8 w-full ml-[calc(25%-32px)]">
                {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center w-full">
                        <div
                            className={`min-w-8 min-h-8 rounded-[100%] flex items-center justify-center ${
                                currentStep >= step
                                    ? "bg-yellow-50 text-richblack-900"
                                    : "bg-richblack-700 text-richblack-300"
                            }`}
                        >
                            {step}
                        </div>
                        {step < 4 && (
                            <div
                                className={`h-1 w-full mx-2 ${
                                    currentStep > step ? "bg-yellow-50" : "bg-richblack-700"
                                }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="bg-richblack-800 rounded-lg p-6 w-full">
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Select Course</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="w-full p-2 rounded-lg bg-richblack-700 text-richblack-5"
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <FiSearch className="absolute right-3 top-3 text-richblack-300" />
                        </div>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-50 mx-auto"></div>
                                <p className="mt-2 text-richblack-300">Loading courses...</p>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-richblack-300">No approved courses found</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {courses
                                    .filter(course => 
                                        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((course) => (
                                        <div
                                            key={course._id}
                                            className={`p-4 rounded-lg cursor-pointer transition-all ${
                                                selectedCourse?._id === course._id
                                                    ? "bg-yellow-50 text-richblack-900"
                                                    : "bg-richblack-700 hover:bg-richblack-600"
                                            }`}
                                            onClick={() => setSelectedCourse(course)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-medium">{course.courseName}</h3>
                                                    <p className="text-sm text-richblack-300">{course.courseCode}</p>
                                                </div>
                                                {selectedCourse?._id === course._id && (
                                                    <FiCheck className="text-lg" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Choose Batch/Year</h2>
                        <div className="flex flex-row gap-8">
                            <div>
                                <label className="block text-sm font-medium mb-2">Year</label>
                                <div className="flex flex-wrap gap-2">
                                    {years.map((year) => (
                                        <button
                                            key={year}
                                            className={`px-4 py-2 rounded-lg ${
                                                selectedYear === year
                                                    ? "bg-yellow-50 text-richblack-900"
                                                    : "bg-richblack-700 hover:bg-richblack-600"
                                            }`}
                                            onClick={() => setSelectedYear(selectedYear === year ? "" : year)}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Semester</label>
                                <div className="flex flex-wrap gap-2">
                                    {semesters.map((sem) => (
                                        <button
                                            key={sem}
                                            className={`px-4 py-2 rounded-lg ${
                                                selectedSemester === sem
                                                    ? "bg-yellow-50 text-richblack-900"
                                                    : "bg-richblack-700 hover:bg-richblack-600"
                                            }`}
                                            onClick={() => setSelectedSemester(selectedSemester === sem ? "" : sem)}
                                        >
                                            {sem}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Pick Students</h2>
                        <div className="flex justify-between items-center">
                            <div className="relative flex-1 mr-4">
                                <input
                                    type="text"
                                    placeholder="Search by name or PRN..."
                                    className="w-full p-2 rounded-lg bg-richblack-700 text-richblack-5"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <FiSearch className="absolute right-3 top-3 text-richblack-300" />
                            </div>
                            <button
                                className="px-4 py-2 rounded-lg bg-richblack-700 hover:bg-richblack-600"
                                onClick={handleSelectAll}
                            >
                                {selectedStudents.length === filteredStudents.length
                                    ? "Clear All"
                                    : "Select All"}
                            </button>
                        </div>
                        {studentsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-50 mx-auto"></div>
                                <p className="mt-2 text-richblack-300">Loading students...</p>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-richblack-300">No students found</p>
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-richblack-300">
                                            <th className="p-2">Select</th>
                                            <th className="p-2">PRN</th>
                                            <th className="p-2">Roll No.</th>
                                            <th className="p-2">Name</th>
                                            <th className="p-2">Email</th>
                                            <th className="p-2">Year</th>
                                            <th className="p-2">Semester</th>
                                            <th className="p-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => {
                                            const isAllocated = hasCourseAllocated(student);
                                            return (
                                                <tr
                                                    key={student.prn}
                                                    className={`hover:bg-richblack-700 ${
                                                        selectedStudents.some(s => s.prn === student.prn)
                                                            ? "bg-richblack-600"
                                                            : ""
                                                    }`}
                                                >
                                                    <td className="p-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudents.some(s => s.prn === student.prn)}
                                                            onChange={() => handleStudentSelect(student)}
                                                            disabled={isAllocated}
                                                        />
                                                    </td>
                                                    <td className="p-2">{student.prn}</td>
                                                    <td className="p-2">{student.rollNumber}</td>
                                                    <td className="p-2">{`${student.firstName} ${student.lastName}`}</td>
                                                    <td className="p-2">{student.email}</td>
                                                    <td className="p-2">{student.year}</td>
                                                    <td className="p-2">{student.semester}</td>
                                                    <td className="p-2">
                                                        {isAllocated ? (
                                                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-50/20 text-yellow-50">
                                                                Already Allocated
                                                            </span>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Review & Confirm</h2>
                        <div className="bg-richblack-700 rounded-lg p-4">
                            <h3 className="text-lg font-medium mb-4">
                                You're about to assign {selectedStudents.length} student{selectedStudents.length === 1 ? "" : "s"} to {selectedCourse?.courseName}
                            </h3>
                            <div className="max-h-64 overflow-y-auto">
                                {selectedStudents.map((student) => (
                                    <div
                                        key={student.prn}
                                        className="flex items-center justify-between p-2 hover:bg-richblack-600 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{`${student.firstName} ${student.lastName}`}</p>
                                            <p className="text-sm text-richblack-300">
                                                PRN: {student.prn} | Roll No: {student.rollNumber}
                                            </p>
                                        </div>
                                        <button
                                            className="text-red-400 hover:text-red-300"
                                            onClick={() => handleStudentSelect(student)}
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error and Success Messages */}
            {allocationError && (
                <div className={`mb-4 p-4 rounded-lg ${
                    allocationError.type === "partial" 
                        ? "bg-brown-500/20 border border-brown-500" 
                        : "bg-pink-500/20 border border-pink-500"
                }`}>
                    <p className={`${
                        allocationError.type === "partial" 
                            ? "text-brown-200" 
                            : "text-pink-200"
                    }`}>
                        {allocationError.message}
                    </p>
                    {allocationError.type === "partial" && allocationError.failedStudents && (
                        <div className="mt-2 space-y-1">
                            {allocationError.failedStudents.map((student, index) => (
                                <p key={index} className="text-brown-200 text-sm">
                                    • {student.name}: {student.reason}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {allocationSuccess && (
                <div className="mb-4 p-4 rounded-lg bg-caribbeangreen-500/20 border border-caribbeangreen-500">
                    <p className="text-caribbeangreen-200">Course allocated successfully!</p>
                </div>
            )}

            {/* Allocation Results Modal */}
            {showAllocationModal && allocationResults && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-richblack-800 p-6 rounded-lg max-w-2xl w-full">
                        <h3 className="text-xl font-semibold text-richblack-5 mb-4">Course Allocation Results</h3>
                        
                        <div className="space-y-4">
                            {/* Course Details */}
                            <div className="bg-richblack-700 p-4 rounded-lg">
                                <p className="text-richblack-5 font-medium">Course: {selectedCourse?.courseName || "Unknown Course"}</p>
                                <p className="text-richblack-300 text-sm">{selectedCourse?.courseCode || "No Course Code"}</p>
                            </div>

                            {/* Successfully Allocated Students */}
                            {allocationResults?.totalAllocated && allocationResults.totalAllocated.length > 0 && (
                                <div className="bg-caribbeangreen-500/20 p-4 rounded-lg border border-caribbeangreen-500">
                                    <p className="text-caribbeangreen-200 font-medium mb-2">
                                        Successfully Allocated ({allocationResults.totalAllocated.length} student{allocationResults.totalAllocated.length === 1 ? "" : "s"})
                                    </p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {allocationResults.totalAllocated.map((student, index) => (
                                            <div key={index} className="text-caribbeangreen-200 text-sm bg-caribbeangreen-500/10 p-3 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{student.firstName} {student.lastName}</span>
                                                    <span className="text-caribbeangreen-300 text-xs">({student.email})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Failed Allocations */}
                            {allocationResults?.failedAllocations && allocationResults.failedAllocations.length > 0 && (
                                <div className="bg-pink-500/20 p-4 rounded-lg border border-pink-500">
                                    <p className="text-pink-200 font-medium mb-2">
                                        Failed Allocations ({allocationResults.failedAllocations.length} student{allocationResults.failedAllocations.length === 1 ? "" : "s"})
                                    </p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {allocationResults.failedAllocations.map((student, index) => (
                                            <div key={index} className="text-pink-200 text-sm bg-pink-500/10 p-3 rounded-lg">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                                                        <span className="text-pink-300 text-xs">({student.email})</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-pink-300 text-xs">
                                                        <span className="font-medium">Reason:</span>
                                                        <span className="italic">{student.error}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary Message */}
                            {/* <div className="bg-richblack-700 p-4 rounded-lg">
                                <p className="text-richblack-5 font-medium">{allocationResults.message}</p>
                            </div> */}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleModalClose}
                                className="px-4 py-2 rounded-lg bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 w-full">
                <button
                    className={`px-6 py-2 rounded-lg bg-richblack-700 hover:bg-richblack-600`}
                    onClick={handleBack}
                >
                    Back
                </button>
                <button
                    className={`px-6 py-2 rounded-lg flex items-center ${
                        (currentStep === 1 && !selectedCourse) ||
                        (currentStep === 3 && selectedStudents.length === 0)
                            ? "bg-richblack-700 text-richblack-300 cursor-not-allowed"
                            : "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                    }`}
                    onClick={currentStep === 4 ? handleAllocateCourse : handleNext}
                    disabled={
                        (currentStep === 1 && !selectedCourse) ||
                        (currentStep === 3 && selectedStudents.length === 0)
                    }
                >
                    {currentStep === 4 ? "Allocate Course" : "Next"}
                    {currentStep < 4 && <FiChevronRight className="ml-2" />}
                </button>
            </div>
        </div>
    );
};

export default CourseAssignmentWizard; 