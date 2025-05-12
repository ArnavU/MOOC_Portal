import toast from "react-hot-toast";
import { QUIZ_API } from "../apis";
import { apiConnector } from "../apiConnector";



// quizData = {
//   title: "Quiz 1",
//   description: "This is a sample quiz",
//   questions: [
//     {
//       question: "What is the capital of France?",
//       options: ["Paris", "London", "Berlin", "Madrid"],
//       correctAnswer: "Paris"
//     },
//   ]
// };
export const createQuiz = async (quizData) => {
  const toastId = toast.loading("Creating Quiz...");
  try {
    const response = await apiConnector("POST", QUIZ_API.CREATE_QUIZ, quizData);
    console.log("CREATE_QUIZ_API API RESPONSE............", response);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Quiz Created Successfully");
  } catch (error) {
    console.log("CREATE_QUIZ_API API ERROR............", error);
    toast.error(error.response.data.message);
  } finally {
    toast.dismiss(toastId);
  }
}

export const deleteQuiz = async (subsectionId) => {
  const toastId = toast.loading("Deleting Quiz...");
  try {
    const response = await apiConnector("DELETE", QUIZ_API.DELETE_QUIZ + `/${subsectionId}`);
    console.log("DELETE_QUIZ_API API RESPONSE............", response);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Quiz Deleted Successfully");
  } catch (error) {
    console.log("DELETE_QUIZ_API API ERROR............", error);
    toast.error(error.response.data.message);
  } finally {
    toast.dismiss(toastId);
  }
}

export const getQuizDetails = async (subsectionId) => {
  const toastId = toast.loading("Fetching Quiz Details...");
  try {
    const response = await apiConnector("GET", QUIZ_API.GET_QUIZ_DETAILS + `/${subsectionId}`);
    console.log("GET_QUIZ_DETAILS_API API RESPONSE............", response);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.quizData;
  } catch (error) {
    console.log("GET_QUIZ_DETAILS_API API ERROR............", error);
    toast.error(error.response.data.message);
  } finally {
    toast.dismiss(toastId);
  }
}

export const getSubsectionIdsWithQuizzes = async (courseId) => {
  const toastId = toast.loading("Fetching Quiz Details...");
  try {
    const response = await apiConnector("GET", QUIZ_API.GET_SUBSECTION_IDS_WITH_QUIZZES + `/${courseId}`);
    console.log("GET_QUIZ_DETAILS_API API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error(response?.data?.message);
    }
    return response?.data?.subSectionIds;
  } catch (error) {
    console.log("GET_QUIZ_DETAILS_API API ERROR............", error);
    toast.error(error?.response?.data?.message);
  } finally {
    toast.dismiss(toastId);
  }
}

export const submitQuiz = async (subSectionId, answers) => {
  const toastId = toast.loading("Submitting Quiz...");
  try {
    const response = await apiConnector("POST", QUIZ_API.SUBMIT_QUIZ_API, { subSectionId, answers });
    console.log("SUBMIT_QUIZ_API API RESPONSE............", response);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Quiz Submitted Successfully");
  } catch (error) {
    console.log("SUBMIT_QUIZ_API API ERROR............", error);
    toast.error(error.response.data.message);
  } finally {
    toast.dismiss(toastId);
  }
}

export const getSubmittedQuizzes = async (courseId) => {
  const toastId = toast.loading("Fetching Submitted Quizzes...");
  try {
    const response = await apiConnector("GET", QUIZ_API.GET_SUBMITTED_QUIZZES_API + `/${courseId}`);
    console.log("GET_SUBMITTED_QUIZZES_API API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }
    return response?.data?.data;
  } catch (error) {
    console.log("GET_SUBMITTED_QUIZZES_API API ERROR............", error);
    toast.error(error.response.data.message);
  } finally {
    toast.dismiss(toastId);
  }
}