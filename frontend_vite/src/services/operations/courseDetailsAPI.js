import { toast } from "react-hot-toast";
import { setProgress } from "../../slices/loadingBarSlice";

import { updateCompletedLectures } from "../../slices/viewCourseSlice";
// import { setLoading } from "../../slices/profileSlice";
import { apiConnector } from "../apiConnector";
import { courseEndpoints } from "../apis";

const {
  COURSE_DETAILS_API,
  COURSE_CATEGORIES_API,
  CREATE_CATEGORY_API,
  GET_ALL_COURSE_API,
  CREATE_COURSE_API,
  EDIT_COURSE_API,
  CREATE_SECTION_API,
  CREATE_SUBSECTION_API,
  UPDATE_SECTION_API,
  UPDATE_SUBSECTION_API,
  DELETE_SECTION_API,
  DELETE_SUBSECTION_API,
  GET_ALL_INSTRUCTOR_COURSES_API,
  DELETE_COURSE_API,
  GET_FULL_COURSE_DETAILS_AUTHENTICATED,
  CREATE_RATING_API,
  LECTURE_COMPLETION_API,
  ADD_COURSE_TO_CATEGORY_API,
  SEARCH_COURSES_API,
  PENDING_COURSES_API,
  APPROVE_COURSE_API,
  GET_DEPARTMENT_COURSES_API,
  GET_APPROVED_INSTRUCTOR_COURSES,
  UPLOAD_ATTACHMENT_API,
  DELETE_ATTACHMENT_API,
  GET_FIRST_SECTION_SUBSECTION_IDS_API,
} = courseEndpoints;

export const getAllCourses = async () => {
  const toastId = toast.loading("Loading...");
  let result = [];
  try {
    const response = await apiConnector("GET", GET_ALL_COURSE_API);
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Course Categories");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("GET_ALL_COURSE_API API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const fetchCourseDetails = async (courseId, dispatch) => {
  // const toastId = toast.loading("Loading...")
  dispatch(setProgress(50));
  let result = null;
  try {
    const response = await apiConnector("POST", COURSE_DETAILS_API, {
      courseId,
    });
    console.log("COURSE_DETAILS_API API RESPONSE............", response.data);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (error) {
    console.log("COURSE_DETAILS_API API ERROR............", error);
    result = error.response.data;
    // toast.error(error.response.data.message);
  }
  // toast.dismiss(toastId)
  dispatch(setProgress(100));
  //   dispatch(setLoading(false));
  return result;
};

// fetching the available course categories
export const fetchCourseCategories = async () => {
  let result = [];
  try {
    const response = await apiConnector("GET", COURSE_CATEGORIES_API);
    console.log("COURSE_CATEGORIES_API API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Course Categories");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("COURSE_CATEGORY_API API ERROR............", error);
    toast.error(error?.response?.data?.message);
  }
  return result;
};

// add the course details
export const addCourseDetails = async (data) => {
  let result = null;
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("POST", CREATE_COURSE_API, data, {
      "Content-Type": "multipart/form-data"
    });
    console.log("CREATE COURSE API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Add Course Details");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("CREATE COURSE API ERROR............", error);
    toast.error(error.response.data.message);
  }
  toast.dismiss(toastId);
  return result;
};

// edit the course details
export const editCourseDetails = async (data) => {
  let result = null;
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("POST", EDIT_COURSE_API, data, {
      "Content-Type": "multipart/form-data"
    });
    console.log("EDIT COURSE API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Update Course Details");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("EDIT COURSE API ERROR............", error);
    toast.error(error.response.data.message);
  }
  toast.dismiss(toastId);
  return result;
};

// create a section
export const createSection = async (data, token) => {
  let result = null;
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("POST", CREATE_SECTION_API, data, {
      Authorisation: `Bearer ${token}`,
    });
    console.log("CREATE SECTION API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Create Section");
    }
    toast.success("Course Section Created");
    result = response?.data?.updatedCourse;
    console.log("create API RESULT............", result);
  } catch (error) {
    console.log("CREATE SECTION API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// create a subsection
export const createSubSection = async (data, token) => {
  let result = null;
  const toastId = toast.loading("Uploading...");
  try {
    const response = await apiConnector("POST", CREATE_SUBSECTION_API, data, {
      Authorisation: `Bearer ${token}`,
    });
    console.log("CREATE SUB-SECTION API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Add Lecture");
    }
    toast.success("Lecture Added");
    result = response?.data?.data;
  } catch (error) {
    console.log("CREATE SUB-SECTION API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// update a section
export const updateSection = async (data, token) => {
  let result = null;
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("POST", UPDATE_SECTION_API, data, {
      Authorisation: `Bearer ${token}`,
    });
    console.log("UPDATE SECTION API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Update Section");
    }
    toast.success("Course Section Updated");
    result = response?.data?.updatedCourse;
    console.log("Update API RESULT............", result);
  } catch (error) {
    console.log("UPDATE SECTION API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// update a subsection
export const updateSubSection = async (data, token) => {
  let result = null;
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("POST", UPDATE_SUBSECTION_API, data, {
      Authorisation: `Bearer ${token}`,
    });
    console.log("UPDATE SUB-SECTION API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Update Lecture");
    }
    toast.success("Lecture Updated");
    result = response?.data?.data;
  } catch (error) {
    console.log("UPDATE SUB-SECTION API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// delete a section
export const deleteSection = async (data, token) => {
  let result = null;
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("POST", DELETE_SECTION_API, data, {
      Authorisation: `Bearer ${token}`,
    });
    console.log("DELETE SECTION API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Section");
    }
    toast.success("Course Section Deleted");
    result = response?.data?.updatedCourse;
    console.log("Delete API RESULT............", result);
  } catch (error) {
    console.log("DELETE SECTION API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};
// delete a subsection
export const deleteSubSection = async (data, token) => {
  let result = null;
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("POST", DELETE_SUBSECTION_API, data, {
      Authorisation: `Bearer ${token}`,
    });
    console.log("DELETE SUB-SECTION API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Lecture");
    }
    toast.success("Lecture Deleted");
    result = response?.data?.data;
    console.log("Delete subsection API RESULT............", result);
  } catch (error) {
    console.log("DELETE SUB-SECTION API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// fetching all courses under a specific instructor
export const fetchInstructorCourses = async (token) => {
  let result = [];
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_INSTRUCTOR_COURSES_API,
      null,
      {
        Authorisation: `Bearer ${token}`,
      }
    );
    console.log("INSTRUCTOR COURSES API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Instructor Courses");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("INSTRUCTOR COURSES API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// delete a course
export const deleteCourse = async (data, token) => {
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("DELETE", DELETE_COURSE_API, data, {
      Authorisation: `Bearer ${token}`,
    });
    console.log("DELETE COURSE API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Course");
    }
    toast.success("Course Deleted");
  } catch (error) {
    console.log("DELETE COURSE API ERROR............", error);
    toast.error(error.response.data.message);
  }
  toast.dismiss(toastId);
};

// get full details of a course
export const getFullDetailsOfCourse = async (courseId) => {
  const toastId = toast.loading("Loading...");
  //   dispatch(setLoading(true));
  let result = null;
  try {
    const response = await apiConnector(
      "POST",
      GET_FULL_COURSE_DETAILS_AUTHENTICATED,
      {
        courseId,
      }
    );
    console.log("COURSE_FULL_DETAILS_API API RESPONSE............", response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("COURSE_FULL_DETAILS_API API ERROR............", error);
    result = error.response.data;
    // toast.error(error.response.data.message);
  }
  toast.dismiss(toastId);
  //   dispatch(setLoading(false));
  return result;
};

// mark a lecture as complete
export const markLectureAsComplete = async (data, token) => {
  let result = null;
  console.log("mark complete data", data);
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("POST", LECTURE_COMPLETION_API, data, {
      Authorisation: `Bearer ${token}`,
    });
    console.log(
      "MARK_LECTURE_AS_COMPLETE_API API RESPONSE............",
      response
    );

    if (!response.data.message) {
      throw new Error(response.data.error);
    }
    toast.success("Lecture Completed");
    result = true;
  } catch (error) {
    console.log("MARK_LECTURE_AS_COMPLETE_API API ERROR............", error);
    toast.error(error.message);
    result = false;
  }
  toast.dismiss(toastId);
  return result;
};

// create a rating for course
export const createRating = async (data, token) => {
  const toastId = toast.loading("Loading...");
  let success = false;
  try {
    const response = await apiConnector("POST", CREATE_RATING_API, data, {
      Authorisation: `Bearer ${token}`,
    });
    console.log("CREATE RATING API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Create Rating");
    }
    toast.success("Rating Posted");
    success = true;
    return success;
  } catch (error) {
    success = false;
    console.log("CREATE RATING API ERROR............", error);
    toast.error(error.response.data.message);
  }
  finally{
    toast.dismiss(toastId);
  }
};

//add course to Category
export const addCourseToCategory = async (data, token) => {
  const toastId = toast.loading("Loading...");
  let success = false;
  try {
    const response = await apiConnector(
      "POST",
      ADD_COURSE_TO_CATEGORY_API,
      data,
      {
        Authorisation: `Bearer ${token}`,
      }
    );
    console.log("ADD COURSE TO CATEGORY API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Add Course To Category");
    }
    toast.success("Course Added To Category");
    success = true;
  } catch (error) {
    success = false;
    console.log("ADD COURSE TO CATEGORY API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return success;
};

//search courses
export const searchCourses = async (searchQuery, dispatch) => {
  // const toastId = toast.loading("Loading...")
  dispatch(setProgress(50));
  let result = null;
  try {
    const response = await apiConnector("POST", SEARCH_COURSES_API, {
      searchQuery: searchQuery,
    });
    console.log("SEARCH COURSES API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Search Courses");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("SEARCH COURSES API ERROR............", error);
    toast.error(error.message);
  }
  // toast.dismiss(toastId)
  dispatch(setProgress(100));
  return result;
};

//create category
export const createCategory = async (data, token) => {
  const toastId = toast.loading("Loading...");
  let success = false;
  try {
    const response = await apiConnector("POST", CREATE_CATEGORY_API, data, {
      Authorisation: `Bearer ${token}`,
    });
    console.log("CREATE CATEGORY API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Create Category");
    }
    toast.success("Category Created");
    success = true;
  } catch (error) {
    success = false;
    console.log("CREATE CATEGORY API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return success;
};

// HOD Course Approval APIs
export const fetchPendingCourses = async () => {
  try {
    const response = await apiConnector("GET", PENDING_COURSES_API);
    console.log("PENDING COURSES API RESPONSE............", response.data);  
    return response.data;
  } catch (error) {
    console.error("Error fetching pending courses:", error);
    throw error;
  }
};

export const approveCourse = async (courseId) => {
  try {
    await apiConnector("POST", APPROVE_COURSE_API, {
      courseId,
    });
  } catch (error) {
    throw error;
  }
};

export const fetchDepartmentCourses = async () => {
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("GET", GET_DEPARTMENT_COURSES_API);
    if (!response?.data?.success) {
      throw new Error(response?.data?.message);
    }
    toast.success("Department Courses Fetched Successfully");
    return response.data;
  } catch (error) {
    console.log("GET_DEPARTMENT_COURSES_API ERROR............", error);
    toast.error(error?.response?.data?.message || "Failed to fetch department courses");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const fetchApprovedInstructorCourses = async () => {
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("GET", GET_APPROVED_INSTRUCTOR_COURSES);
    console.log("GET APPROVED INSTRUCTOR COURSES API RESPONSE............", response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Approved Courses Fetched Successfully");
    return response.data.data;
  } catch (error) {
    console.log("GET APPROVED INSTRUCTOR COURSES API ERROR............", error);
    toast.error(error.response?.data?.message || "Failed to fetch approved courses");
    return [];
  } finally {
    toast.dismiss(toastId);
  }
};

export const uploadAttachment = async (sectionId, courseId, file) => {
  let result = null;
  const toastId = toast.loading("Uploading attachment...");
  try {
    const formData = new FormData();
    formData.append("sectionId", sectionId);
    formData.append("courseId", courseId);
    formData.append("attachment", file);
    const response = await apiConnector("POST", UPLOAD_ATTACHMENT_API, formData, {
      "Content-Type": "multipart/form-data",
    });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not upload attachment");
    }
    toast.success("Attachment uploaded successfully");
    result = response.data.updatedCourse;
  } catch (error) {
    console.log("UPLOAD_ATTACHMENT_API ERROR............", error);
    toast.error(error?.response?.data?.message || "Could not upload attachment");
  }
  toast.dismiss(toastId);
  return result;
};

export const deleteAttachment = async (sectionId, courseId, url) => {
  let result = null;
  const toastId = toast.loading("Deleting attachment...");
  try {
    const response = await apiConnector("POST", DELETE_ATTACHMENT_API, {
      sectionId,
      courseId,
      url,
    });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not delete attachment");
    }
    toast.success("Attachment deleted successfully");
    result = response.data.updatedCourse;
  } catch (error) {
    console.log("DELETE_ATTACHMENT_API ERROR............", error);
    toast.error(error?.response?.data?.message || "Could not delete attachment");
  }
  toast.dismiss(toastId);
  return result;
};

export const getFirstSectionSubSectionIds = async (courseId) => {
  let result = null;
  try {
    const response = await apiConnector("GET", `${GET_FIRST_SECTION_SUBSECTION_IDS_API}/${courseId}`);
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch section and subsection IDs");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("GET_FIRST_SECTION_SUBSECTION_IDS_API ERROR............", error);
  }
  return result;
}