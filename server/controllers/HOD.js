/**
 * Controller for handling Head of Department (HOD) operations.
 * This controller manages student registration and management operations for HODs.
 * It handles bulk student registration, updates existing student records, and maintains
 * proper relationships between User and Profile models.
 * 
 * For each student registration:
 * - Validates required fields (firstName, lastName, email, rollNumber, prn, batch, currentYear, semester, contactNumber)
 * - Checks for duplicate roll numbers and PRNs
 * - Creates new students with hashed email as password
 * - Updates existing students while preserving their passwords
 * - Creates/updates associated Profile documents
 * - Sends welcome emails to newly created students
*/

const User = require("../models/User");
const Profile = require("../models/Profile");
const { sendWelcomeEmail } = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const cloudinary = require("cloudinary");

// Register multiple students
exports.registerMultipleStudents = async (req, res) => {
    try {
        const { students } = req.body;
        const { id, institute } = req.user;
        const hod = await User.findById(id);
        const department = hod.department;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a list of students to register"
            });
        }

        // Validation arrays
        const validationErrors = [];
        const errorMessages = [];
        const validStudents = [];
        const existingStudents = [];

        // First pass: Validate all students
        for (const student of students) {
            const { firstName, lastName, email, rollNumber, prn, batch, currentYear, semester, contactNumber } = student;

            // Check required fields
            if (!firstName || !lastName || !email || !rollNumber || !prn || !batch || !currentYear || !semester || !contactNumber) {
                validationErrors.push({
                    student: `${firstName || ''} ${lastName || ''}`,
                    error: "Missing required fields"
                });
                continue;
            }

            // Check for existing email
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                if (existingUser.accountType !== "Student") {
                    validationErrors.push({
                        student: `${firstName} ${lastName}`,
                        error: `Email ${email} is already registered as a ${existingUser.accountType}`
                    });
                    continue;
                }

                // If it's a student account, check for duplicate PRN and roll number
                const existingProfile = await Profile.findById(existingUser.additionalDetails);
                if (existingProfile) {
                    if (existingProfile.prn !== prn) {
                        validationErrors.push({
                            student: `${firstName} ${lastName}`,
                            error: `PRN ${prn} does not match with existing student's PRN ${existingProfile.prn}`
                        });
                        continue;
                    }
                    if (existingProfile.rollNumber !== parseInt(rollNumber)) {
                        validationErrors.push({
                            student: `${firstName} ${lastName}`,
                            error: `Roll number ${rollNumber} does not match with existing student's roll number ${existingProfile.rollNumber}`
                        });
                        continue;
                    }
                }

                // Student exists and details match, add to update list
                existingStudents.push({
                    ...student,
                    _id: existingUser._id,
                    password: existingUser.password,
                    department: department,
                    institute: institute._id,
                    accountType: "Student",
                    image: existingUser.image
                });
            } else {
                // Check for duplicate PRN in the same department
                const existingPRN = await User.aggregate([
                    {
                        $lookup: {
                          from: 'profiles', // The collection name for Profile documents
                          localField: 'additionalDetails',
                          foreignField: '_id',
                          as: 'profile'
                        }
                      },
                      {
                        $match: {
                          department: department, // Match the department
                          'profile.prn': prn // Match the PRN in the joined profile
                        }
                      },
                      {
                        $limit: 1 // Return only one user
                      }
                ]);

                if (existingPRN.length > 0) {
                    validationErrors.push({
                        student: `${firstName} ${lastName}`,
                        error: `PRN ${prn} already exists in the department`
                    });
                    continue;
                }

                // Check for duplicate roll number in the same department
                const existingRollNumber = await User.aggregate([
                    {
                        $lookup: {
                            from: "profiles",
                            localField: "additionalDetails",
                            foreignField: "_id",
                            as: "profile"
                        }
                    },
                    {
                        $match: {
                            department: department,
                            "profile.rollNumber": Number(rollNumber)
                        }
                    },
                    {
                        $limit: 1
                    }
                ])

                if (existingRollNumber.length > 0) {
                    validationErrors.push({
                        student: `${firstName} ${lastName}`,
                        error: `Roll number ${rollNumber} already exists in the department`
                    });
                    continue;
                }

                // Hash the email to use as password
                const hashedPassword = await bcrypt.hash(email, 10);
                
                // New student, add to create list
                validStudents.push({
                    ...student,
                    department: department,
                    institute: institute._id,
                    accountType: "Student",
                    password: hashedPassword,
                    image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`
                });
            }
        }

        // If there are any validation errors, return them without registering any students
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation errors found",
                validationErrors,
                errorMessages
            });
        }

        // Create new students
        const createdStudents = [];
        for (const student of validStudents) {
            try {
                // Create profile for new student
                const profile = await Profile.create({
                    gender: null,
                    dateOfBirth: null,
                    about: null,
                    contactNumber: student.contactNumber,
                    prn: student.prn,
                    rollNumber: student.rollNumber,
                    batch: student.batch,
                    year: student.currentYear,
                    semester: student.semester,
                    department: department._id
                });

                // Create user with profile reference
                const newStudent = await User.create({
                    ...student,
                    additionalDetails: profile._id
                });
                createdStudents.push(newStudent);

                // Send welcome email
                await sendWelcomeEmail({
                    email: student.email,
                    firstName: student.firstName,
                    rollNumber: student.rollNumber,
                    password: student.email
                });
            } catch (error) {
                errorMessages.push(`Error creating student ${student.firstName} ${student.lastName}: ${error.message}`);
            }
        }

        // Update existing students
        const updatedStudents = [];
        const previousStudentData = [];
        for (const student of existingStudents) {
            try {
                const { _id, ...updateData } = student;
                const previousStudent = await User.findById(_id).populate('additionalDetails');
                
                // Store previous data
                previousStudentData.push({
                    _id: previousStudent._id,
                    firstName: previousStudent.firstName,
                    lastName: previousStudent.lastName,
                    email: previousStudent.email,
                    rollNumber: previousStudent.additionalDetails.rollNumber,
                    prn: previousStudent.additionalDetails.prn,
                    batch: previousStudent.additionalDetails.batch,
                    currentYear: previousStudent.additionalDetails.year,
                    semester: previousStudent.additionalDetails.semester,
                    contactNumber: previousStudent.additionalDetails.contactNumber,
                    department: previousStudent.department,
                    institute: previousStudent.institute,
                    profile: previousStudent.additionalDetails
                });

                // Update profile
                await Profile.findByIdAndUpdate(
                    previousStudent.additionalDetails._id,
                    {
                        contactNumber: student.contactNumber,
                        prn: student.prn,
                        rollNumber: student.rollNumber,
                        year: student.currentYear,
                        semester: student.semester
                    }
                );

                // Update user
                const updatedStudent = await User.findByIdAndUpdate(
                    _id,
                    { $set: updateData },
                    { new: true }
                );
                updatedStudents.push(updatedStudent);
            } catch (error) {
                errorMessages.push(`Error updating student ${student.firstName} ${student.lastName}: ${error.message}`);
            }
        }

        // If there were any errors during registration, return them
        if (errorMessages.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some students could not be processed",
                errorMessages
            });
        }

        res.status(201).json({
            success: true,
            message: "Students processed successfully",
            data: {
                totalProcessed: createdStudents.length + updatedStudents.length,
                newlyRegistered: createdStudents.length,
                updated: updatedStudents.length,
                students: [...createdStudents, ...updatedStudents].map(student => ({
                    _id: student._id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    email: student.email,
                    rollNumber: student.additionalDetails.rollNumber,
                    prn: student.additionalDetails.prn,
                    batch: student.additionalDetails.batch,
                    currentYear: student.additionalDetails.year,
                    semester: student.additionalDetails.semester,
                    contactNumber: student.additionalDetails.contactNumber,
                    status: createdStudents.some(s => s._id.equals(student._id)) ? 'new' : 'updated'
                })),
                previousData: previousStudentData
            }
        });

    } catch (error) {
        console.error("Error in registerMultipleStudents:", error);
        return res.status(500).json({
            success: false,
            message: "Error registering students",
            error: error.message
        });
    }
};

// Get list of students in HOD's department
exports.getDepartmentStudents = async (req, res) => {
    console.log("Getting Department Students");
    try {
        // Get HOD's department from request
        const hod = await User.findById(req.user.id);

        // Find all students in the department
        const students = await User.find({
            accountType: "Student",
            department: hod.department
        })
        .select("-password") // Exclude password from response
        .populate("additionalDetails") // Populate profile details
        .populate("department")
        .sort({ createdAt: -1 }); // Sort by newest first

        console.log("Students:", students);

        // Return success response with students data
        return res.status(200).json({
            success: true,
            message: "Students fetched successfully",
            data: students
        });
    } catch (error) {
        console.error("Error fetching department students:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch students",
            error: error.message
        });
    }
};

// Update student details
exports.updateStudentDetails = async (req, res) => {
    console.log("Updating student details");
    try {
        const { students } = req.body; // Array of student details
        const { id } = req.user;
        const hod = await User.findById(id);
        const department = hod.department;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a list of students to update"
            });
        }

        // Arrays to track results
        const validationErrors = [];
        const errorMessages = [];
        const studentsToUpdate = [];

        // First pass: Validate all students
        for (const studentData of students) {
            const { studentId, firstName, lastName, email, prn, rollNumber, batch, year, semester, contactNumber } = studentData;

            try {
                // Validate studentId
                if (!mongoose.Types.ObjectId.isValid(studentId)) {
                    validationErrors.push({
                        studentId,
                        error: "Invalid student ID"
                    });
                    continue;
                }

                // Find the student
                const student = await User.findById(studentId).populate("additionalDetails");
                
                if (!student) {
                    validationErrors.push({
                        studentId,
                        error: "Student not found"
                    });
                    continue;
                }

                // Check if the student belongs to the same department
                if (student.department.toString() !== department.toString()) {
                    validationErrors.push({
                        studentId,
                        error: "Student does not belong to your department"
                    });
                    continue;
                }

                // Check for duplicate email
                if (email) {
                    const existingStudentWithEmail = await User.findOne({
                        _id: { $ne: new mongoose.Types.ObjectId(studentId) },
                        email: email
                    });

                    if (existingStudentWithEmail) {
                        validationErrors.push({
                            studentId,
                            error: `Email ${email} is already registered`
                        });
                        continue;
                    }
                }

                // Check for unique PRN within the department
                if (prn) {
                    const existingStudentWithPRN = await User.aggregate([
                        {
                            $lookup: {
                                from: "profiles",
                                localField: "additionalDetails",    
                                foreignField: "_id",
                                as: "profile"
                            }
                        },
                        {
                            $match: {
                                "_id": { $ne: new mongoose.Types.ObjectId(studentId) },
                                "department": new mongoose.Types.ObjectId(department),
                                "profile.prn": prn
                            }
                        },
                        {
                            $limit: 1
                        }
                    ])

                    if (existingStudentWithPRN.length > 0) {
                        validationErrors.push({
                            studentId,
                            error: `PRN ${prn} already exists in the department`
                        });
                        continue;
                    }
                }

                // Check for unique roll number within the department
                if (rollNumber) {
                    const existingStudentWithRoll = await User.aggregate([
                        {
                            $lookup: {
                                from: "profiles",
                                localField: "additionalDetails",
                                foreignField: "_id",
                                as: "profile"
                            }
                        },
                        {
                            $match: {
                                "_id": { $ne: new mongoose.Types.ObjectId(studentId) },
                                "department": new mongoose.Types.ObjectId(department),
                                "profile.rollNumber": Number(rollNumber)
                            }
                        },
                        {
                            $limit: 1
                        }
                    ])

                    if (existingStudentWithRoll.length > 0) {
                        validationErrors.push({
                            studentId,
                            error: `Roll number ${rollNumber} already exists in the department`
                        });
                        continue;
                    }
                }

                // If all validations pass, add to studentsToUpdate array
                studentsToUpdate.push({
                    student,
                    updateData: {
                        firstName,
                        lastName,
                        email,
                        prn,
                        rollNumber,
                        batch,
                        year,
                        semester,
                        contactNumber
                    }
                });

            } catch (error) {
                errorMessages.push({
                    studentId,
                    error: error.message
                });
            }
        }

        // If there are any validation errors, return them without updating
        if (validationErrors.length > 0 || errorMessages.length > 0) {
            console.log("Validation errors:", validationErrors);
            console.log("Error messages:", errorMessages);
            return res.status(400).json({
                success: false,
                message: "Some students could not be updated",
                validationErrors,
                errorMessages
            });
        }

        // Second pass: Perform all updates
        const updatedStudents = [];
        for (const { student, updateData } of studentsToUpdate) {
            try {
                // Update user details
                if (updateData.firstName) student.firstName = updateData.firstName;
                if (updateData.lastName) student.lastName = updateData.lastName;
                if (updateData.email) student.email = updateData.email;

                // Update profile details
                const profile = await Profile.findById(student.additionalDetails);
                if (updateData.prn) profile.prn = updateData.prn;
                if (updateData.rollNumber) profile.rollNumber = updateData.rollNumber;
                if (updateData.batch) profile.batch = updateData.batch;
                if (updateData.year) profile.year = updateData.year;
                if (updateData.semester) profile.semester = updateData.semester;
                if (updateData.contactNumber) profile.contactNumber = updateData.contactNumber;

                // Save both user and profile
                await Promise.all([student.save(), profile.save()]);

                // Fetch updated student details
                const updatedStudent = await User.findById(student._id)
                    .populate("additionalDetails")
                    .populate("department")
                    .select("-password");

                updatedStudents.push(updatedStudent);
            } catch (error) {
                errorMessages.push({
                    studentId: student._id,
                    error: error.message
                });
            }
        }

        // If there were any errors during updates, return them
        if (errorMessages.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some students could not be updated",
                errorMessages,
                updatedStudents
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student details updated successfully",
            data: updatedStudents
        });

    } catch (error) {
        console.error("Error in updateStudentDetails:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating student details",
            error: error.message
        });
    }
};

// Register new faculty member
exports.registerFaculty = async (req, res) => {
    console.log("Registering Faculty Member");
    try {
        const { firstName, lastName, email, phoneNumber, password, designation } = req.body;
        const profilePhoto = req.files?.profilePhoto ? req.files.profilePhoto : null;

        // Validate required fields
        if (!firstName || !lastName || !email || !phoneNumber || !password || !designation) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                validationErrors: [
                    {
                        field: !firstName ? "First Name" : 
                               !lastName ? "Last Name" : 
                               !email ? "Email" : 
                               !phoneNumber ? "Contact Number" : 
                               !password ? "Password" : "Designation",
                        message: "This field is required"
                    }
                ]
            });
        }
        console.log("Request Body:", req.body);
        console.log("Profile Photo:", profilePhoto);

        // Get HOD's department from request
        const hod = await User.findById(req.user.id);
        const department = hod.department;
        const institute = hod.institute;
        // Check if faculty already exists
        const existingFaculty = await User.findOne({ email });
        if (existingFaculty) {
            return res.status(400).json({
                success: false,
                message: "Faculty member with this email already exists",
                validationErrors: [
                    {
                        field: "email",
                        message: "Email already exists"
                    }
                ]
            });
        }

        // Handle profile photo upload to Cloudinary
        let profilePhotoUrl = null;
        if (profilePhoto) {
            try {
                const result = await uploadImageToCloudinary(profilePhoto, process.env.FOLDER_NAME);
                profilePhotoUrl = result?.secure_url;
            } catch (error) {
                console.error("Error uploading profile photo to Cloudinary:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading profile photo",
                    validationErrors: [
                        {
                            field: "profilePhoto",
                            message: "Failed to upload profile photo"
                        }
                    ]
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create profile document first
        const profile = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: phoneNumber,
            designation: designation,
        });
        
        // Create new faculty member (User document)
        const faculty = await User.create({
            firstName,
            lastName,
            email,
            department: department,
            institute: institute,
            password: hashedPassword,
            accountType: "Instructor",
            additionalDetails: profile._id,
            image: profilePhotoUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`
        });
        
        const updatedFaculty = await User.findById(faculty._id).populate("additionalDetails").populate("department");
        console.log("Updated Faculty:", updatedFaculty);

        // Remove password from response
        faculty.password = undefined;

        return res.status(201).json({
            success: true,
            message: "Faculty member registered successfully",
            data: updatedFaculty
        });

    } catch (error) {
        console.error("Error registering faculty:", error);
        return res.status(500).json({
            success: false,
            message: "Error registering faculty member",
            validationErrors: [
                {
                    field: "server",
                    message: error.message
                }
            ]
        });
    }
};

// Get faculty list by department
exports.getFacultyList = async (req, res) => {
    console.log("Getting Faculty List");
    try {
        // Get HOD's department from request
        const hod = await User.findById(req.user.id);
        const { department } = hod.department;

        // Find all faculty members in the department
        const facultyList = await User.find({
            accountType: "Instructor",
            department: department
        })
        .select("-password") // Exclude password from response
        .populate("additionalDetails") // Populate profile details
        .populate("department")
        .sort({ createdAt: -1 }); // Sort by newest first

        // Return success response with faculty list
        return res.status(200).json({
            success: true,
            message: "Faculty list fetched successfully",
            data: facultyList
        });

    } catch (error) {
        console.error("Error fetching faculty list:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch faculty list",
            error: error.message
        });
    }
};

// Edit faculty details
exports.editFaculty = async (req, res) => {
    try {
        const { facultyId, firstName, lastName, email, designation, phoneNumber, password } = req.body;
        const profilePhoto = req.files?.image ? req.files.image : null;

        // Validate required fields
        if (!facultyId || !firstName || !lastName || !email || !designation || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "All fields except password are required",
                validationErrors: [
                    {
                        field: !facultyId ? "Faculty ID" : 
                               !firstName ? "First Name" : 
                               !lastName ? "Last Name" : 
                               !email ? "Email" : 
                               !designation ? "Designation" : "Contact Number",
                        message: "This field is required"
                    }
                ]
            });
        }

        // Check if faculty exists and is of type Instructor
        const faculty = await User.findById(facultyId).populate("additionalDetails");
        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty member not found",
                validationErrors: [
                    {
                        field: "facultyId",
                        message: "Faculty member not found"
                    }
                ]
            });
        }

        // Check if the user is of type Instructor
        if (faculty.accountType !== "Instructor") {
            return res.status(400).json({
                success: false,
                message: "User is not a faculty member",
                validationErrors: [
                    {
                        field: "facultyId",
                        message: "User is not a faculty member"
                    }
                ]
            });
        }

        // Check if email is being changed and if new email already exists
        if (email !== faculty.email) {
            const existingFaculty = await User.findOne({ email });
            if (existingFaculty) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                    validationErrors: [
                        {
                            field: "email",
                            message: `Email ${email} already exists`
                        }
                    ]
                });
            }
        }

        // Validate password if provided
        if (password && password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
                validationErrors: [
                    {
                        field: "password",
                        message: "Password must be at least 6 characters long"
                    }
                ]
            });
        }

        // Update profile
        await Profile.findByIdAndUpdate(
            faculty.additionalDetails._id,
            {
                contactNumber: phoneNumber,
                designation: designation
            }
        );

        // upload profile photo to cloudinary
        let profilePhotoUrl = null;
        if (profilePhoto) {
            try {
                const result = await uploadImageToCloudinary(profilePhoto, process.env.FOLDER_NAME);
                profilePhotoUrl = result?.secure_url;
            } catch (error) {
                console.error("Error uploading profile photo to Cloudinary:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading profile photo",
                    validationErrors: [
                        {
                            field: "profilePhoto",
                            message: "Failed to upload profile photo"
                        }
                    ]
                });
            }
        }

        // Prepare update data
        const updateData = {
            firstName,
            lastName,
            email,
            image: profilePhotoUrl || faculty.image
        };

        // Update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        // Update faculty
        const updatedFaculty = await User.findByIdAndUpdate(
            facultyId,
            updateData,
            { new: true }
        ).populate("additionalDetails");

        // Remove password from response
        updatedFaculty.password = undefined;

        return res.status(200).json({
            success: true,
            message: "Faculty details updated successfully",
            data: updatedFaculty
        });

    } catch (error) {
        console.error("Error updating faculty:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating faculty details",
            validationErrors: [
                {
                    field: "server",
                    message: error.message
                }
            ]
        });
    }
};

// Faculty Management