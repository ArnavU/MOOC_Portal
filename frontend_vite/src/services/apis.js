const BASE_URL = import.meta.env.VITE_BASE_URL;

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
};

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_ALL_INSTRUCTOR_DASHBOARD_DETAILS_API:
    BASE_URL + "/profile/getInstructorDashboardDetails",
};

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
  GET_UNENROLLED_COURSES_API: BASE_URL + "/student/unenrolledCourses",
  GET_ENROLLED_COURSES_API: BASE_URL + "/student/enrolledCourses",
  ENROLL_IN_COURSE_API: BASE_URL + "/student/enrollInCourse",
};

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/courseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
  ADD_COURSE_TO_CATEGORY_API: BASE_URL + "/course/addCourseToCategory",
  SEARCH_COURSES_API: BASE_URL + "/course/searchCourse",
  CREATE_CATEGORY_API: BASE_URL + "/course/createCategory",
  PENDING_COURSES_API: BASE_URL + "/course/pendingCourses",
  APPROVE_COURSE_API: BASE_URL + "/course/approveCourse",
  GET_DEPARTMENT_COURSES_API: BASE_URL + "/course/getDepartmentCourses",
  GET_APPROVED_INSTRUCTOR_COURSES: BASE_URL + "/course/approvedInstructorCourses",
  UPLOAD_ATTACHMENT_API: BASE_URL + "/course/uploadAttachment",
  DELETE_ATTACHMENT_API: BASE_URL + "/course/deleteAttachment",
};

// INSTRUCTOR ENDPOINTS
export const instructorEndpoints = {
  GET_DEPARTMENT_STUDENTS: BASE_URL + "/instructor/departmentStudents",
  ALLOCATE_COURSE_API: BASE_URL + "/instructor/assignCourseToStudents",
  COURSE_ALLOCATIONS_API: BASE_URL + "/instructor/courseAllocations",
};

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
};

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
};

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/getCategoryPageDetails",
};
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/contact/contactUs",
};

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateDisplayPicture",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
};

export const supervisorEndpoints = {
  CREATE_INSTITUTE_API: BASE_URL + "/serviceProvider/institute",
  GET_ALL_INSTITUTES_API: BASE_URL + "/serviceProvider/institutes",
  UPDATE_INSTITUTE_API: BASE_URL + "/serviceProvider/institute",
  CREATE_CATEGORY_API: BASE_URL + "/serviceProvider/category",
  GET_ALL_CATEGORIES_API: BASE_URL + "/serviceProvider/categories",
  UPDATE_CATEGORY_API: BASE_URL + "/serviceProvider/category",
  DELETE_CATEGORY_API: BASE_URL + "/serviceProvider/category",
};

export const INSTITUTE_ADMIN_API = {
    // HOD Management Endpoints
    GET_ALL_HODS: BASE_URL + "/instituteAdmin/hods",
    CREATE_HOD: BASE_URL + "/instituteAdmin/hods",
    UPDATE_HOD: BASE_URL + "/instituteAdmin/hods",

    // Department Management Endpoints
    GET_ALL_DEPARTMENTS: BASE_URL + "/instituteAdmin/departments",
    CREATE_DEPARTMENT: BASE_URL + "/instituteAdmin/departments",
    UPDATE_DEPARTMENT: BASE_URL + "/instituteAdmin/departments",
    DELETE_DEPARTMENT: BASE_URL + "/instituteAdmin/departments",
};

export const HOD_API = {
    REGISTER_STUDENTS: BASE_URL + "/hod/registerStudents",

    // Student Management Endpoints
    GET_ALL_STUDENTS: BASE_URL + "/hod/students",
    GET_STUDENT_BY_ID: BASE_URL + "/hod/students/",
    CREATE_STUDENT: BASE_URL + "/hod/students",
    UPDATE_STUDENT: BASE_URL + "/hod/students",
    DELETE_STUDENT: BASE_URL + "/hod/students/",

    // Faculty Management Endpoints
    POST_REGISTER_FACULTY: BASE_URL + "/hod/faculty",
    GET_FACULTY_LIST: BASE_URL + "/hod/facultyList",
    GET_FACULTY_BY_ID: BASE_URL + "/hod/faculty/",
    CREATE_FACULTY: BASE_URL + "/hod/faculty",
    UPDATE_FACULTY: BASE_URL + "/hod/faculty",
    DELETE_FACULTY: BASE_URL + "/hod/faculty/",
    PUT_EDIT_FACULTY: BASE_URL + "/hod/faculty",
    // Department Management Endpoints
    GET_DEPARTMENT_STUDENTS: BASE_URL + "/hod/students"
};

export const QUIZ_API = {
  CREATE_QUIZ: BASE_URL + "/quiz/create",
  DELETE_QUIZ: BASE_URL + "/quiz/delete",
  GET_QUIZ_DETAILS: BASE_URL + "/quiz/details",
  GET_SUBSECTION_IDS_WITH_QUIZZES: BASE_URL + "/quiz/subsectionIds",
  SUBMIT_QUIZ_API: BASE_URL + "/quiz/submit",
  GET_SUBMITTED_QUIZZES_API: BASE_URL + "/quiz/submittedQuizes",
};