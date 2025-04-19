const jwt = require("jsonwebtoken");
require("dotenv").config();

//auth
exports.auth = async (req, res, next) => {
    try {
        // Extract token from cookies
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            console.log("Token missing in auth middleware");
            return res.status(401).json({
                success: false,
                message: "Token Missing",
            });
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        } catch (error) {
            console.log("Invalid token ", error);
            return res.status(401).json({
                success: false,
                message: "Token is invalid",
            });
        }
        next();
    } catch (error) {
        console.log("Error in auth middleware: ", error);
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating the token",
        });
    }
};

//isStudent
exports.isStudent = async (req, res, next) => {
 try{
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Students only',
            });
        }
        next();
 }
 catch(error) {
    return res.status(500).json({
        success:false,
        message:'User role cannot be verified, please try again'
    })
 }
}


//isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Instructor") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Instructor only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }




exports.isAdmin = (req, res, next) => {
    try {
        if (req.user.accountType !== "institute_admin") {
            return res.status(401).json({
                success: false,
                message: "this is protected route for Admin only"
            })
        }
        next();

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User Role is not matching'
        });
    }
}

exports.isServiceProvider = (req, res, next) => {
    try {
        if (req.user.accountType !== "service_provider") {
            return res.status(401).json({
                success: false,
                message: "this is protected route for Service Provider only"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User Role is not matching'
        });
    }
};

exports.isHOD = (req, res, next) => {
    try {
        if (req.user.accountType !== "hod") {
            return res.status(401).json({
                success: false,
                message: "this is protected route for HOD only"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User Role is not matching'
        });
    }
};