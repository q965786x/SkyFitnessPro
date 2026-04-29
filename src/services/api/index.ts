export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getMe 
} from '../auth/authApi';

export { 
    getAllCourses, 
    getCourseById,
    getCourseById as getCourse, // алиас
    getUserCourses, 
    getWorkoutById,
    getWorkoutById as getWorkout, // алиас
    getCourseProgressById,
    getCourseProgressById as getCourseProgress, // алиас
    addCourseToUser, 
    deleteCourseFromUser,
    resetCourseProgress,
    getCourseWorkouts,
    getWorkoutProgress,
    saveWorkoutProgress,
    resetWorkoutProgress
} from '../courses/coursesApi';

export { default as apiClient } from '../api';
export { BASE_URL } from '../constants';
export { storage } from '../storage';