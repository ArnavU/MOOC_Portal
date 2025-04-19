const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const Profile = require("../models/Profile");
const Institute = require("../models/Institute");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Category = require("../models/Category");

require("dotenv").config;


// // Used by service provider
// exports.createInstituteAdmin = async (req, res) => {
//     try {
//         const { 
//             adminFirstName, 
//             adminLastName, 
//             instituteName, 
//             instituteAddress, 
//             contactNumber, 
//             instituteEmail, // also used as institute admin email
//             website 
//         } = req.body;

//         // Check for missing fields
//         if (!adminFirstName || !adminLastName || !instituteName || !instituteAddress || !contactNumber || !instituteEmail) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required",
//             });
//         }

//         // Check if an institute with the given email or name already exists
//         const existingInstitute = await Institute.findOne({ 
//             $or: [
//                 { email: instituteEmail },
//                 { name: instituteName }
//             ]
//         });
//         if (existingInstitute) {
//             return res.status(409).json({
//                 success: false,
//                 message: existingInstitute.email === instituteEmail 
//                     ? "Institute with this email already registered"
//                     : "Institute with this name already registered",
//             });
//         }

//         // Create institute document
//         let institute = await Institute.create({
//             name: instituteName,
//             address: instituteAddress,
//             contactNumber,
//             email: instituteEmail,
//             website,
//         });

//         // Check if a user with the same email already exists
//         const existingUser = await User.findOne({ email: instituteEmail });
//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 message: "User already exists",
//             });
//         }

//         // Create a blank profile document for the institute admin
//         const profile = await Profile.create({});

//         // Create institute admin user with reference to the institute
//         const user = await User.create({
//             firstName: adminFirstName,
//             lastName: adminLastName,
//             email: instituteEmail,
//             accountType: "institute_admin",
//             institute: institute._id,
//             password: await bcryptjs.hash(instituteEmail, 10),
//             image: `https://api.dicebear.com/5.x/initials/svg?seed=${adminFirstName} ${adminLastName}`,
//             additionalDetails: profile._id,
//         });

//         // Update institute document to include the admin id at field "admin"
//         institute = await Institute.findByIdAndUpdate(
//             institute._id,
//             { admin: user._id },
//             { new: true }
//         );

//         return res.status(201).json({
//             success: true,
//             message: "Institute admin created successfully",
//             institute,
//             user,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Institute admin creation failed",
//         });
//     }
// }; 

// Create a new institute
exports.createInstitute = async (req, res) => {
    try {
        const { 
            adminFirstName, 
            adminLastName, 
            adminEmail,
            instituteName, 
            instituteAddress, 
            contactNumber, 
            instituteEmail,
            website,
        } = req.body;

        // Get the institute logo from request files
        const instituteLogo = req.files?.instituteLogo;

        // Check if any of the required fields are missing
        if (
            !adminFirstName ||
            !adminLastName ||
            !adminEmail ||
            !instituteName ||
            !instituteAddress ||
            !contactNumber ||
            !instituteEmail ||
            !instituteLogo
        ) {
            return res.status(400).json({
                success: false,
                message: "All Fields are Mandatory",
            });
        }

        // Upload the Institute Logo to Cloudinary
        const logoImage = await uploadImageToCloudinary(
            instituteLogo,
            process.env.FOLDER_NAME
        );

        // Check if an institute with the given email or name already exists
        const existingInstitute = await Institute.findOne({ 
            $or: [
                { instituteEmail: instituteEmail },
                { instituteName: instituteName }
            ]
        });

        if (existingInstitute) {
            return res.status(409).json({
                success: false,
                message: existingInstitute.instituteEmail === instituteEmail 
                    ? "Institute with this email already registered"
                    : "Institute with this name already registered",
            });
        }

        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }

        // Create institute document
        let institute = await Institute.create({
            instituteName: instituteName,
            instituteAddress: instituteAddress,
            contactNumber,
            instituteEmail: instituteEmail,
            website,
            instituteLogo: logoImage.secure_url,
        });

        // Create a blank profile document for the institute admin
        const profile = await Profile.create({});

        // Create institute admin user with reference to the institute
        const instituteAdmin = await User.create({
            firstName: adminFirstName,
            lastName: adminLastName,
            email: adminEmail,
            accountType: "institute_admin",
            institute: institute._id,
            password: await bcryptjs.hash(adminEmail, 10),
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${adminFirstName} ${adminLastName}`,
            additionalDetails: profile._id,
        });

        // Update institute document to include the admin id at field "admin"
        institute = await Institute.findByIdAndUpdate(
            institute._id,
            { admin: instituteAdmin._id },
            { new: true }
        );

        return res.status(201).json({
            success: true,
            message: "Institute and admin created successfully",
            institute,
            instituteAdmin,
        });
    } catch (error) {
        // Handle any errors that occur during the creation of the institute
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create institute",
            error: error.message,
        });
    }
};

// Get all institutes
exports.getAllInstitutes = async (req, res) => {

    console.log("getAllInstitutes called");
    try {
        const allInstitutes = await Institute.find({})
            .populate({
                path: 'admin',
                select: 'firstName lastName email'
            });
        console.log("allInstitutes: ", allInstitutes);
        return res.status(200).json({
            success: true,
            data: allInstitutes,
        });
    } catch (error) {
        console.log("ServiceProvider getAllInstitutes error: ", error);
        return res.status(404).json({
            success: false,
            message: `Can't Fetch Institute Data`,
            error: error.message,
        });
    }
};

// Get institute details
exports.getInstituteDetails = async (req, res) => {
    try {
        const { instituteId } = req.body;
        const instituteDetails = await Institute.findById(instituteId);

        if (!instituteDetails) {
            return res.status(404).json({
                success: false,
                message: "Institute Not Found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Institute fetched successfully",
            data: instituteDetails,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            success: false,
            message: `Can't Fetch Institute Data`,
            error: error.message,
        });
    }
}; 

// Update institute details
exports.updateInstitute = async (req, res) => {
    try {
        const { 
            instituteId,
            instituteName,
            instituteAddress,
            contactNumber,
            instituteEmail,
            website,
            adminFirstName,
            adminLastName,
            adminEmail
        } = req.body;

        console.log("updateInstitute called with: ", req.body);

        // Check if institute exists
        const institute = await Institute.findById(instituteId);
        if (!institute) {
            return res.status(404).json({
                success: false,
                message: "Institute not found",
            });
        }

        // Check if the new email is already taken by another institute
        if (instituteEmail !== institute.instituteEmail) {
            const existingInstitute = await Institute.findOne({ 
                instituteEmail,
                _id: { $ne: instituteId } // Exclude current institute
            });
            if (existingInstitute) {
                return res.status(409).json({
                    success: false,
                    message: "Email already in use by another institute",
                });
            }
        }

        // Update institute details
        const updatedInstitute = await Institute.findByIdAndUpdate(
            instituteId,
            {
                instituteName,
                instituteAddress,
                contactNumber,
                instituteEmail,
                website,
            },
            { new: true }
        );

        // Update admin details if they exist
        if (institute.admin) {
            const updatedAdmin = await User.findByIdAndUpdate(
                institute.admin,
                {
                    firstName: adminFirstName,
                    lastName: adminLastName,
                    email: adminEmail,
                },
                { new: true }
            );

            // Check if the new admin email is already taken by another user
            if (adminEmail !== updatedAdmin.email) {
                const existingUser = await User.findOne({ 
                    email: adminEmail,
                    _id: { $ne: institute.admin } // Exclude current admin
                });
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: "Admin email already in use by another user",
                    });
                }
            }
        }

        // If there's a new logo file, upload it
        if (req.files?.instituteLogo) {
            const logoImage = await uploadImageToCloudinary(
                req.files.instituteLogo,
                process.env.FOLDER_NAME
            );
            updatedInstitute.instituteLogo = logoImage.secure_url;
            await updatedInstitute.save();
        }

        // Get the updated institute with populated admin details
        const finalInstitute = await Institute.findById(instituteId)
            .populate({
                path: 'admin',
                select: 'firstName lastName email'
            });

        console.log("finalInstitute after update: ", finalInstitute);

        return res.status(200).json({
            success: true,
            message: "Institute updated successfully",
            data: finalInstitute,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update institute",
            error: error.message,
        });
    }
}; 

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;

        // Check if the category name is provided
        if (!categoryName) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        // Check if a category with the same name already exists
        const existingCategory = await Category.findOne({ name: categoryName });
        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category with this name already exists",
            });
        }

        // Create a new category
        const category = await Category.create({
            name: categoryName,
            description,
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create category",
            error: error.message,
        });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const { categoryId, categoryName, description } = req.body;

        // Check if the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Update the category details
        category.name = categoryName || category.name;
        category.description = description || category.description;
        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update category",
            error: error.message,
        });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Check if the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Delete the category
        await category.remove();

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete category",
            error: error.message,
        });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        
        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
            error: error.message,
        });
    }
};

