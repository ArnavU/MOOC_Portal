// Import necessary modules
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const cloudinary = require("cloudinary").v2;

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
	try {
		// Extract necessary information from the request body
		const { sectionId, title , description,courseId } = req.body;
		const video = req.files.videoFile;

		// Check if all necessary fields are provided
		if (!sectionId || !title || !description || !video || !courseId ) {
			return res
				.status(404)
				.json({ success: false, message: "All Fields are Required" });
		}

		const ifsection= await Section.findById(sectionId);
		if (!ifsection) {
            return res
                .status(404)
                .json({ success: false, message: "Section not found" });
        }


		// Upload the video file to Cloudinary
		const uploadDetails = await uploadImageToCloudinary(
			video,
			process.env.FOLDER_VIDEO
		);
		console.log("uploadDetails",uploadDetails);
		console.log("Video duration: ",uploadDetails.duration);

		console.log(uploadDetails);
		// Create a new sub-section with the necessary information
		const SubSectionDetails = await SubSection.create({
			title: title,
			timeDuration: uploadDetails?.duration || 0,
			description: description,
			videoUrl: uploadDetails.secure_url,
		});

		// Update the corresponding section with the newly created sub-section
		const updatedSection = await Section.findByIdAndUpdate(
			{ _id: sectionId },
			{ $push: { subSection: SubSectionDetails._id } },
			{ new: true }
		).populate("subSection");

		// Get the updated course with all sections and subsections
		const updatedCourse = await Course.findById(courseId)
			.populate({ 
				path: "courseContent", 
				populate: { 
					path: "subSection" 
				} 
			})
			.exec();
		
		// Calculate total videos
		let totalVideos = 0;
		updatedCourse.courseContent.forEach(section => {
			totalVideos += section.subSection.length;
		});

		// Update the course with the new total videos count
		await Course.findByIdAndUpdate(
			courseId,
			{ totalVideos: totalVideos },
			{ new: true }
		);

		// Return the updated course in the response
		return res.status(200).json({ 
			success: true, 
			data: updatedCourse,
			message: "Subsection created successfully."
		});
	} catch (error) {
		// Handle any errors that may occur during the process
		console.error("Error creating new sub-section:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};


// UPDATE a sub-section
exports.updateSubSection = async (req,res) => {

	try {
		// Extract necessary information from the request body
		const { SubsectionId, title , description,courseId } = req.body;
		const video = req?.files?.videoFile;

		
		let uploadDetails = null;
		// Upload the video file to Cloudinary
		if(video){
		 uploadDetails = await uploadImageToCloudinary(
			video,
			process.env.FOLDER_VIDEO
		);
		}

		// Create a new sub-section with the necessary information
		const SubSectionDetails = await SubSection.findByIdAndUpdate({_id:SubsectionId},{
			title: title || SubSection.title,
			// timeDuration: timeDuration,
			description: description || SubSection.description,
			videoUrl: uploadDetails?.secure_url || SubSection.videoUrl,
		},{ new: true });

		
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		// Return the updated section in the response
		return res.status(200).json({ success: true, data: updatedCourse });
	} catch (error) {
		// Handle any errors that may occur during the process
		console.error("Error creating new sub-section:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}

}


exports.deleteSubSection = async(req, res) => {

	try {
		const {subSectionId,courseId} = req.body;
		const sectionId=req.body.sectionId;
	if(!subSectionId || !sectionId){
		return res.status(404).json({
            success: false,
            message: "all fields are required",
        });
	}
	const ifsubSection = await SubSection.findById({_id:subSectionId});
	const ifsection= await Section.findById({_id:sectionId});

	if(!ifsubSection){
		return res.status(404).json({
            success: false,
            message: "Sub-section not found",
        });
	}
	if(!ifsection){
		return res.status(404).json({
            success: false,
            message: "Section not found",
        });
    }

	const url = ifsubSection.videoUrl;
	const extractPublicId = (url) => {
		const regex = /\/upload\/(?:v\d+\/)?(.+?)\.(mp4|webm|mov|avi)/;
		const match = url.match(regex);
		return match ? match[1] : null;
	};
	  
	const publicId = extractPublicId(url);
	try {
		const result = await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
		console.log("✅ Successfully deleted video from cloudinary:", result);
	} catch (error) {
		console.error("❌ Error deleting video from cloudinary:", error.message);
		return res.status(500).json({
			success: false,
			message: "Error deleting video from cloudinary",
			error: error.message
		});
	}


	await SubSection.findByIdAndDelete(subSectionId);
	await Section.findByIdAndUpdate({_id:sectionId},{$pull:{subSection:subSectionId}},{new:true});
	const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();

	// Calculate total videos after deletion
	let totalVideos = 0;
	updatedCourse.courseContent.forEach(section => {
		totalVideos += section.subSection.length;
	});

	// Update the course with the new total videos count
	await Course.findByIdAndUpdate(
		courseId,
		{ totalVideos: totalVideos },
		{ new: true }
	);

	return res.status(200).json({ 
		success: true, 
		message: "Sub-section deleted and total videos updated", 
		data: updatedCourse 
	});
		
	} catch (error) {
		// Handle any errors that may occur during the process
        console.error("Error deleting sub-section:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
		
	}
};