const Department = require("../models/Department");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Profile = require("../models/Profile");

// Get all HODs
exports.getAllHODs = async (req, res) => {
    console.log("Get all HODs called");
    try {
        const hods = await User.find({ accountType: "hod" })
            .populate("department", "name code")
            .populate("additionalDetails", "contactNumber")
            .select("-password");
        
        return res.status(200).json({
            success: true,
            message: "HODs fetched successfully",
            data: hods
        });
    } catch (error) {
        console.error("Error fetching HODs:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching HODs",
            error: error.message
        });
    }
};


// Create Department
exports.createDepartment = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        // Validate required fields
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Name and code are required fields"
            });
        }

        // Check if department code already exists in the institute
        const existingDepartment = await Department.findOne({
            institute: req.user.institute,
            code: code
        });

        if (existingDepartment) {
            return res.status(409).json({
                success: false,
                message: "Department with this code already exists"
            });
        }

        // Create department
        const department = await Department.create({
            name,
            code,
            description,
            institute: req.user.institute
        });

        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            department
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create department",
            error: error.message
        });
    }
};


// Update Department
exports.updateDepartment = async (req, res) => {
    console.log("Update department called");
    try {
        const { departmentId, name, code, description } = req.body;

        // Check if department exists and belongs to the institute
        const department = await Department.findOne({
            _id: departmentId,
            institute: req.user.institute
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        // Check if new code conflicts with existing departments
        if (code && code !== department.code) {
            const existingDepartment = await Department.findOne({
                institute: req.user.institute,
                code: code,
                _id: { $ne: departmentId }
            });

            if (existingDepartment) {
                return res.status(409).json({
                    success: false,
                    message: "Department with this code already exists"
                });
            }
        }

        // Update department
        const updatedDepartment = await Department.findByIdAndUpdate(
            departmentId,
            {
                name: name || department.name,
                code: code || department.code,
                description: description || department.description
            },
            { new: true }
        ).populate('hod', 'firstName lastName email');

        return res.status(200).json({
            success: true,
            message: "Department updated successfully",
            department: updatedDepartment
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update department",
            error: error.message
        });
    }
};

// Update Department HOD
exports.updateDepartmentHod = async (req, res) => {
    console.log("Update HOD called");
    console.log("Request body: ", req.body);
    try {
        const { departmentId, hodId, firstName, lastName, email, contactNumber } = req.body;
        const instituteAdmin = await User.findById(req.user.id);

        // Check if department exists and belongs to the institute
        const department = await Department.findOne({
            _id: departmentId,
            institute: instituteAdmin.institute
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        // Check if HOD exists
        const hod = await User.findOne({
            _id: hodId,
            accountType: "hod",
            institute: instituteAdmin.institute
        });

        if (!hod) {
            return res.status(404).json({
                success: false,
                message: "HOD not found"
            });
        }

        // Check if new email conflicts with existing users
        if (email && email !== hod.email) {
            const existingUser = await User.findOne({ 
                email,
                _id: { $ne: hodId }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already in use by another user"
                });
            }
        }

        // Update HOD's profile
        if (contactNumber) {
            await Profile.findByIdAndUpdate(hod.additionalDetails, {
                contactNumber
            });
        }

        // Update HOD's user information
        const updatedHod = await User.findByIdAndUpdate(
            hodId,
            {
                firstName: firstName || hod.firstName,
                lastName: lastName || hod.lastName,
                email: email || hod.email
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "HOD updated successfully",
            hod: updatedHod
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update HOD",
            error: error.message
        });
    }
};


// Delete Department
exports.deleteDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        // Check if department exists and belongs to the institute
        const department = await Department.findOne({
            _id: departmentId,
            institute: req.user.institute
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        // Check if department has HOD
        if (department.hod) {
            // Update HOD's user record to remove department reference
            await User.findByIdAndUpdate(department.hod, {
                $unset: { department: "" }
            });
        }

        // Delete department
        await Department.findByIdAndDelete(departmentId);

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete department",
            error: error.message
        });
    }
};

// Get All Departments
exports.getDepartmentsAndHods = async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        if (departmentId) {
            const department = await Department.findById(departmentId)
                .populate("hod", "firstName lastName email");
            
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Department fetched successfully",
                data: department
            });
        }

        const departments = await Department.find()
            .populate("hod", "firstName lastName email");
        
        return res.status(200).json({
            success: true,
            message: "Departments fetched successfully",
            data: departments
        });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching departments",
            error: error.message
        });
    }
};

// Create Department HOD
exports.createDepartmentHod = async (req, res) => {
    try {
        const { 
            departmentId,
            firstName,
            lastName,
            email,
            contactNumber,
            password
        } = req.body;

        const instituteAdmin = await User.findById(req.user.id);

        // Check if department exists and belongs to the institute
        const department = await Department.findOne({
            _id: departmentId,
            institute: instituteAdmin.institute
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        // Check if department already has an HOD
        if (department.hod) {
            return res.status(409).json({
                success: false,
                message: "Department already has an HOD assigned"
            });
        }

        // Check if user with email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Create profile for HOD
        const profile = await Profile.create({
            contactNumber
        });

        // Create HOD user
        const hashedPassword = await bcrypt.hash(password, 10);
        const hodUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType: "hod",
            institute: instituteAdmin.institute,
            department: departmentId,
            additionalDetails: profile._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        // Update department with HOD reference
        department.hod = hodUser._id;
        await department.save();

        return res.status(201).json({
            success: true,
            message: "HOD created and assigned successfully",
            hod: hodUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create and assign HOD",
            error: error.message
        });
    }
};

// Remove Department HOD
exports.removeDepartmentHod = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const instituteAdmin = await User.findById(req.user.id);

        // Check if department exists and belongs to the institute
        const department = await Department.findOne({
            _id: departmentId,
            institute: instituteAdmin.institute
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        if (!department.hod) {
            return res.status(404).json({
                success: false,
                message: "Department does not have an HOD assigned"
            });
        }

        // Update HOD's user record to remove department reference
        await User.findByIdAndUpdate(department.hod, {
            $unset: { department: "" }
        });

        // Remove HOD reference from department
        department.hod = undefined;
        await department.save();

        return res.status(200).json({
            success: true,
            message: "HOD removed successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove HOD",
            error: error.message
        });
    }
};

