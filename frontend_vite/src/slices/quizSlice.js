import { createSlice } from "@reduxjs/toolkit"

const quizDetailsSlice = createSlice({
  name: "quizDetails",
  initialState: {
    quizDetails: null, // questions + questionId, options, correctAnswer
    selectedQuizSubSectionId: null,
    openQuizModal: false,
    subSectionIdsWithQuizzes: [],
    submittedQuizzesDetails: null,
    /*
    {
      "success": true,
      "data": {
        "<quizId>": {
          "totalPoints": <number>,        // Total questions in the quiz
          "scoredPoints": <number>,       // Correctly answered questions
          "answers": {
            "<questionId>": "<userAnswer>",  // Mapping of question to submitted answer
            ...
          }
        },
        ...
      }
    }
    */
    reloadQuizzesDetails: false,
  },
  reducers: {
    setQuizDetails: (state, action) => {
      state.quizDetails = action.payload
    },
    setOpenQuizModal: (state, action) => {
      state.openQuizModal = action.payload
    },
    setSelectedQuizSubSectionId: (state, action) => {
      state.selectedQuizSubSectionId = action.payload
    },
    setSubSectionIdsWithQuizzes: (state, action) => {
      state.subSectionIdsWithQuizzes = action.payload
    },
    setSubmittedQuizzesDetails: (state, action) => {
      state.submittedQuizzesDetails = action.payload
    },
    setReloadQuizzesDetails: (state, action) => {
      state.reloadQuizzesDetails = action.payload
    },
  },
})

export const {
    setQuizDetails,
    setOpenQuizModal,
    setSelectedQuizSubSectionId,
    setSubSectionIdsWithQuizzes,
    setSubmittedQuizzesDetails,
    setReloadQuizzesDetails,
} = quizDetailsSlice.actions

export default quizDetailsSlice.reducer