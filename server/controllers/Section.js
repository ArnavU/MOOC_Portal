const Section = require("../models/Section");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const cloudinary = require("cloudinary").v2;
const path = require('path');

// CREATE a new section
exports.createSection = async (req, res) => {
	try {
		// Extract the required properties from the request body
		const { sectionName, courseId } = req.body;

		// Validate the input
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}
		
		const ifcourse= await Course.findById(courseId);
		if (!ifcourse) {
			return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

		// Create a new section with the given name
		const newSection = await Section.create({ sectionName });

		// Add the new section to the course's content array
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// Return the updated course object in the response
		res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});
	} catch (error) {
		// Handle errors
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

// UPDATE a section
exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId,courseId } = req.body;
		console.log(sectionName, sectionId);
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		res.status(200).json({
			success: true,
			message: "Section updated successfully",
			updatedCourse,

		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// DELETE a section
exports.deleteSection = async (req, res) => {
	try {
		const { sectionId,courseId } = req.body;
		await Section.findByIdAndDelete(sectionId);
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		res.status(200).json({
			success: true,
			message: "Section deleted",
			updatedCourse,
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Upload an attachment to Cloudinary and add to Section, return updated course
exports.uploadAttachment = async (req, res) => {
    try {
        const { sectionId, courseId } = req.body;
        if (!sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "sectionId and courseId are required",
            });
        }
        // Check if file is present
        const file = req.files?.attachment;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No attachment file provided",
            });
        }

        // Upload the file to Cloudinary (resource_type: auto)
        const uploadResult = await uploadImageToCloudinary(
            file,
        //    "attachments",
            process.env.FOLDER_NAME,
            "raw",
            file.name
        );

        // Add the attachment URL to the Section's attachments array
        await Section.findByIdAndUpdate(
            sectionId,
            { $push: { attachments: uploadResult.secure_url } },
            { new: true }
        );

        // Get the updated course with all sections and subsections populated
        const updatedCourse = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: { path: "subSection" }
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: "Attachment uploaded and added to section successfully",
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            resource_type: uploadResult.resource_type,
            original_filename: uploadResult.original_filename,
            format: uploadResult.format,
            bytes: uploadResult.bytes,
            updatedCourse,
        });
    } catch (error) {
        console.error("Error uploading attachment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload attachment",
            error: error.message,
        });
    }
};

// Delete an attachment from Section and Cloudinary, return updated course
exports.deleteAttachment = async (req, res) => {
    try {
        const { sectionId, courseId, url } = req.body;
        if (!sectionId || !courseId || !url) {
            return res.status(400).json({
                success: false,
                message: "sectionId, courseId, and url are required",
            });
        }

        // Remove the attachment URL from the Section's attachments array
        await Section.findByIdAndUpdate(
            sectionId,
            { $pull: { attachments: url } },
            { new: true }
        );

        // Extract public_id from the URL for Cloudinary deletion
        const extractPublicId = (url) => {
            // This regex works for most cloudinary URLs
            const match = url.match(/\/upload\/v\d+\/([^\.]+)\./);
            return match ? match[1] : null;
        };
        const publicId = extractPublicId(url);
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: "Could not extract public_id from URL",
            });
        }

        // Delete the file from Cloudinary (resource_type: auto)
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

        // Get the updated course with all sections and subsections populated
        const updatedCourse = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: { path: "subSection" }
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: "Attachment deleted from section and Cloudinary successfully",
            updatedCourse,
        });
    } catch (error) {
        console.error("Error deleting attachment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete attachment",
            error: error.message,
        });
    }
};

