import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllocatedCourses, enrollInCourse } from "../../../../services/operations/studentAPI";
import { useNavigate } from "react-router-dom";
import { FiBook, FiClock, FiUser, FiCalendar } from "react-icons/fi";
import { IoVideocamOutline } from "react-icons/io5";
import { ProgressBar } from "../../../common/ProgressBar";
import { formatDate } from "../../../../utils/formatDate";

const AssignedCourses = () => {
	const [loading, setLoading] = useState(true);
	const [allocatedCourses, setAllocatedCourses] = useState([]);
	const { token } = useSelector((state) => state.auth);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchAllocatedCourses = async () => {
			try {
				const courses = await getAllocatedCourses();
				if (courses) {
					setAllocatedCourses(courses);
				}
			} catch (error) {
				console.error("Error fetching allocated courses:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchAllocatedCourses();
	}, []);

	const handleEnroll = async (courseId) => {
		try {
			await enrollInCourse(courseId, token);
			// Refresh the allocated courses list after enrollment
			const updatedCourses = await getAllocatedCourses();
			if (updatedCourses) {
				setAllocatedCourses(updatedCourses);
			}
		} catch (error) {
			console.error("Error enrolling in course:", error);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-200px)]">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (!allocatedCourses || allocatedCourses.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
				<div className="text-4xl text-gray-400 mb-4">
					<FiBook />
				</div>
				<h2 className="text-2xl font-semibold text-gray-700 mb-2">No Courses Available</h2>
				<p className="text-gray-500">You don't have any courses allocated to you yet.</p>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">Available Courses</h1>
				<p className="text-gray-600">Enroll in these courses to start learning</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{allocatedCourses.map((allocation) => (
					<div
						key={allocation._id}
						className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
					>
						{/* Course Thumbnail */}
						<div className="relative h-48 bg-gray-200">
							{allocation.course.thumbnail ? (
								<img
									src={allocation.course.thumbnail}
									alt={allocation.course.courseName}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gray-100">
									<IoVideocamOutline className="text-4xl text-gray-400" />
								</div>
							)}
						</div>

						{/* Course Content */}
						<div className="p-4">
							<h3 className="text-lg font-semibold text-gray-800 mb-2">
								{allocation.course.courseName}
							</h3>
							<p className="text-sm text-gray-600 mb-4 line-clamp-2">
								{allocation.course.courseDescription}
							</p>

							{/* Course Stats */}
							<div className="grid grid-cols-2 gap-4 mb-4">
								<div className="flex items-center space-x-2">
									<FiUser className="text-gray-500" />
									<span className="text-sm text-gray-600">
										{allocation.instructor.firstName} {allocation.instructor.lastName}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<FiCalendar className="text-gray-500" />
									<span className="text-sm text-gray-600">
										{formatDate(allocation.createdAt)}
									</span>
								</div>
							</div>

							{/* Validity Period */}
							{allocation.validityEndDate && (
								<div className="mb-4">
									<div className="flex items-center space-x-2 text-sm text-gray-600">
										<FiClock className="text-gray-500" />
										<span>Valid until: {formatDate(allocation.validityEndDate)}</span>
									</div>
								</div>
							)}

							{/* Enroll Button */}
							<button
								onClick={() => handleEnroll(allocation.course._id)}
								className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
							>
								Enroll Now
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default AssignedCourses; 