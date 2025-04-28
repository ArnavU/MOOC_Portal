import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllocatedCourses, enrollInCourse } from "../../../../services/operations/studentAPI";
import { useNavigate } from "react-router-dom";
import { FiBook, FiClock, FiUser, FiCalendar } from "react-icons/fi";
import { IoVideocamOutline } from "react-icons/io5";
import { formatDate } from "../../../../utils/formatDate";

const UnEnrolledCourses = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [unenrolledCourses, setUnenrolledCourses] = useState([]);

	useEffect(() => {
		const fetchUnenrolledCourses = async () => {
			setLoading(true);
			try {
				const courses = await getAllocatedCourses();
				if (courses) {
					setUnenrolledCourses(courses);
				}
			} catch (error) {
				console.error("Error fetching unenrolled courses:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchUnenrolledCourses();
	}, []);

	const handleEnroll = async (courseId) => {
		try {
			await enrollInCourse(courseId);
			// Refresh the unenrolled courses list after enrollment
			const updatedCourses = await getAllocatedCourses();
			if (updatedCourses) {
				setUnenrolledCourses(updatedCourses);
			}
		} catch (error) {
			console.error("Error enrolling in course:", error);
		}
	};

	if (loading) {
		return (
			<div className="flex h-[calc(100vh)] w-full justify-center items-center">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-richblack-500"></div>
			</div>
		);
	}

	if (!unenrolledCourses || unenrolledCourses.length === 0) {
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
		<div className="text-richblack-5 w-[80%] px-4">
			<div className="mb-8">
				<h1 className="text-3xl font-medium text-richblack-5">Available Courses</h1>
			</div>
			<div className="mx-auto max-w-full">
				<div className="flex flex-col gap-8">
					{unenrolledCourses.length === 0 ? (
						<p className="text-center text-lg text-richblack-300">
							You don't have any courses allocated to you yet.
						</p>
					) : (
						unenrolledCourses.map((allocation) => (
							<div 
								key={allocation._id} 
								className="flex flex-col gap-6 rounded-xl bg-richblack-800 p-6 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] md:flex-row relative"
							>
								{/* Instructor Information in Top Right Corner */}
								<div className="absolute top-4 right-4 z-10">
									<div className="relative group">
										<div className="flex items-center gap-2 text-sm text-richblack-300 bg-richblack-700 px-3 py-1 rounded-full">
											<FiUser className="text-lg" />
											<span className="cursor-pointer hover:text-yellow-50 transition-colors">
												{allocation.instructor?.firstName} {allocation.instructor?.lastName}
											</span>
										</div>
										{/* Instructor Popup Card */}
										<div className="absolute right-0 top-full mt-2 w-64 bg-richblack-900 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
											<div className="p-4">
												<div className="flex items-center gap-3 mb-3">
													<img 
														src={allocation.instructor?.profileImage} 
														alt={`${allocation.instructor?.firstName} ${allocation.instructor?.lastName}`}
														className="w-12 h-12 rounded-full object-cover"
													/>
													<div>
														<h3 className="text-yellow-50 font-medium">
															{allocation.instructor?.firstName} {allocation.instructor?.lastName}
														</h3>
														<p className="text-xs text-richblack-300">{allocation.instructor?.email}</p>
													</div>
												</div>
												<div className="text-xs text-richblack-300 space-y-1">
													<p>Department: {allocation.instructor?.department?.name || 'Not Assigned'}</p>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="md:w-[300px] h-[200px] flex-shrink-0">
									<img
										src={allocation.course.thumbnail}
										alt={allocation.course.courseName}
										className="h-full w-full rounded-lg object-contain bg-richblack-700"
									/>
								</div>
								<div className="flex flex-1 flex-col gap-4">
									<div>
										<h2 className="text-xl font-semibold">{allocation.course.courseName}</h2>
										<p className="text-sm text-richblack-300">{allocation.course.courseDescription}</p>
									</div>
									
									<div className="flex flex-wrap items-center gap-4 text-sm text-richblack-300">
										<div className="flex items-center gap-2">
											<FiCalendar className="text-lg" />
											<span>
												Created: {formatDate(allocation.createdAt)}
											</span>
										</div>
										{allocation.validityEndDate && (
											<>
												<span>|</span>
												<div className="flex items-center gap-2">
													<span>
														Valid until: {formatDate(allocation.validityEndDate)}
													</span>
												</div>
											</>
										)}
									</div>

									<div className="mt-auto">
										<button
											onClick={() => handleEnroll(allocation.course._id)}
											className="rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 transition-all duration-200 hover:bg-yellow-100"
										>
											Enroll Now
										</button>
									</div> 
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default UnEnrolledCourses;
