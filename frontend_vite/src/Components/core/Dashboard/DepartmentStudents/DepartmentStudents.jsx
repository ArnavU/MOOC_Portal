import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiBook, FiEye, FiFilter } from 'react-icons/fi';
import { fetchDepartmentStudents } from '../../../../services/operations/InstructorAPI';
import CourseDetailsModal from './CourseDetailsModal';

const DepartmentStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [filters, setFilters] = useState({
        year: '',
        semester: '',
        department: '',
        course: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const data = await fetchDepartmentStudents();
                console.log("Department Students data:", data);
                setStudents(data?.students || []);
            } catch (error) {
                console.error("Error fetching department students:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const handleViewCourses = (student) => {
        setSelectedStudent(student);
        setShowCourseModal(true);
    };

    const handleCloseModal = () => {
        setShowCourseModal(false);
        setSelectedStudent(null);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            year: '',
            semester: '',
            department: '',
            course: ''
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    const filteredStudents = students.filter(student => {
        const matchesSearch = 
            student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.prn.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.rollNumber.toString().toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilters = 
            (!filters.year || student.year === filters.year) &&
            (!filters.semester || student.semester === filters.semester) &&
            (!filters.department || student.department?.name === filters.department) &&
            (!filters.course || student.courses?.some(course => course.courseName === filters.course));

        return matchesSearch && matchesFilters;
    });

    if (loading) {
        return (
            <div className="flex h-[calc(100vh)] w-full justify-center items-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-richblack-500"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-11/12 py-10">
            <div className="mb-14 flex items-center justify-between">
                <h1 className="text-3xl font-medium text-richblack-5">Department Students</h1>
            </div>

            {/* Search and Filters Section */}
            <div className="mb-8 space-y-4">
                {/* Search Bar */}
                <div className="flex items-center gap-4 rounded-lg bg-richblack-800 p-4 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)]">
                    <FiSearch className="text-richblack-300 text-xl" />
                    <input
                        type="text"
                        placeholder="Search by name, email, PRN, or roll number"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-richblack-5 placeholder:text-richblack-300 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg bg-richblack-700 text-richblack-5 hover:bg-richblack-600 transition-colors"
                            >
                                <span className="text-sm">Clear Filters</span>
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-richblack-700 text-richblack-5 hover:bg-richblack-600 transition-colors"
                        >
                            <FiFilter className="text-lg" />
                            <span className="text-sm">Filters</span>
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-richblack-800 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)]">
                        {/* Year Filter */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-richblack-300">Year</label>
                            <select
                                name="year"
                                value={filters.year}
                                onChange={handleFilterChange}
                                className="bg-richblack-700 text-richblack-5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                            >
                                <option value="">All Years</option>
                                <option value="FY">FY</option>
                                <option value="SY">SY</option>
                                <option value="TY">TY</option>
                                <option value="BTech">BTech</option>
                            </select>
                        </div>

                        {/* Semester Filter */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-richblack-300">Semester</label>
                            <select
                                name="semester"
                                value={filters.semester}
                                onChange={handleFilterChange}
                                className="bg-richblack-700 text-richblack-5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                            >
                                <option value="">All Semesters</option>
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                                <option value="3">Semester 3</option>
                            </select>
                        </div>

                        {/* Department Filter */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-richblack-300">Department</label>
                            <select
                                name="department"
                                value={filters.department}
                                onChange={handleFilterChange}
                                className="bg-richblack-700 text-richblack-5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                            >
                                <option value="">All Departments</option>
                                {Array.from(new Set(students.map(student => student.department?.name)))
                                    .filter(Boolean)
                                    .map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                            </select>
                        </div>

                        {/* Course Filter */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-richblack-300">Course</label>
                            <select
                                name="course"
                                value={filters.course}
                                onChange={handleFilterChange}
                                className="bg-richblack-700 text-richblack-5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                            >
                                <option value="">All Courses</option>
                                {Array.from(new Set(students.flatMap(student => 
                                    student.courses?.map(course => course.courseName) || []
                                ))).map(courseName => (
                                    <option key={courseName} value={courseName}>{courseName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Students Table */}
            <div className="rounded-lg bg-richblack-800 p-4 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)]">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-richblack-700">
                            <th className="py-2 px-4 text-left text-sm font-medium text-richblack-300">Student</th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-richblack-300">PRN</th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-richblack-300">Roll No.</th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-richblack-300">Year</th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-richblack-300">Semester</th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-richblack-300">Department</th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-richblack-300">Courses</th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-richblack-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr 
                                key={student._id} 
                                className="border-b border-richblack-700 hover:bg-richblack-700/50 transition-colors"
                            >
                                <td className="py-2 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-richblack-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {student.image ? (
                                                <img 
                                                    src={student.image} 
                                                    alt={`${student.firstName} ${student.lastName}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <FiUser className="text-richblack-300 text-lg" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-richblack-5">
                                                {student.firstName} {student.lastName}
                                            </p>
                                            <p className="text-xs text-richblack-300">{student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-2 px-4 text-sm text-richblack-5">{student.prn}</td>
                                <td className="py-2 px-4 text-sm text-richblack-5">{student.rollNumber}</td>
                                <td className="py-2 px-4 text-sm text-richblack-5">{student.year}</td>
                                <td className="py-2 px-4 text-sm text-richblack-5">{student.semester}</td>
                                <td className="py-2 px-4 text-sm text-richblack-5">{student.department?.name || 'N/A'}</td>
                                <td className="py-2 px-4">
                                    <div className="flex items-center gap-2">
                                        <FiBook className="text-richblack-300 text-sm" />
                                        <span className="text-sm text-richblack-5">
                                            {student.totalCourses} ({student.enrolledCourses} enrolled)
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-4">
                                    <button
                                        onClick={() => handleViewCourses(student)}
                                        className="flex items-center gap-1 text-yellow-50 hover:text-yellow-100 transition-colors"
                                    >
                                        <FiEye className="text-sm" />
                                        <span className="text-xs">View Courses</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Course Details Modal */}
            {showCourseModal && selectedStudent && (
                <CourseDetailsModal 
                    student={selectedStudent} 
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default DepartmentStudents; 