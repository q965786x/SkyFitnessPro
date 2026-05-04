import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getAllCourses,
  getCourseById,
  getUserCourses,
  addCourseToUser, 
  deleteCourseFromUser, 
  getCourseWorkouts    
} from '@/services/api/coursesApi';
import { storage } from '@/services/storage';
import { CourseType, WorkoutType } from '@/sharedTypes/sharedTypes';


interface CoursesState {
  allCourses: CourseType[];
  userCoursesIds: string[];
  currentCourse: CourseType | null;
  courseWorkouts: Record<string, WorkoutType[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  allCourses: [],
  userCoursesIds: [],
  currentCourse: null,
  courseWorkouts: {},
  isLoading: false,
  error: null,
};

export const fetchAllCourses = createAsyncThunk('courses/fetchAll', async () => {
  const courses = await getAllCourses();
  return courses;
});

export const fetchUserCourses = createAsyncThunk('courses/fetchUser', async () => {
  const courses = await getUserCourses();
  storage.setUserCoursesIds(courses);
  return courses;
});

export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (courseId: string) => {
    const course = await getCourseById(courseId);
    return course;
  }
);

export const fetchCourseWorkouts = createAsyncThunk(
  'courses/fetchWorkouts',
  async (courseId: string) => {
    const workouts = await getCourseWorkouts(courseId);
    return { courseId, workouts };
  }
);

export const addCourse = createAsyncThunk(
  'courses/add',
  async (courseId: string) => {
    await addCourseToUser(courseId);
    return courseId;
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (courseId: string) => {
    await deleteCourseFromUser(courseId);
    return courseId;
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all courses
      .addCase(fetchAllCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allCourses = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки курсов';
      })
      // Fetch user courses
      .addCase(fetchUserCourses.fulfilled, (state, action) => {
        state.userCoursesIds = action.payload;
      })
      // Fetch course by id
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.currentCourse = action.payload;
      })
      // Fetch course workouts
      .addCase(fetchCourseWorkouts.fulfilled, (state, action) => {
        state.courseWorkouts[action.payload.courseId] = action.payload.workouts;
      })
      // Add course
      .addCase(addCourse.fulfilled, (state, action) => {
        if (!state.userCoursesIds.includes(action.payload)) {
          state.userCoursesIds.push(action.payload);
        }
        storage.setUserCoursesIds(state.userCoursesIds);
      })
      // Delete course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.userCoursesIds = state.userCoursesIds.filter(id => id !== action.payload);
        storage.setUserCoursesIds(state.userCoursesIds);
        delete state.courseWorkouts[action.payload];
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        const courseId = action.meta.arg;
        state.userCoursesIds = state.userCoursesIds.filter(id => id !== courseId);
        delete state.courseWorkouts[courseId];
      });
  },
});

export const { clearCurrentCourse, clearError } = coursesSlice.actions;
export default coursesSlice.reducer;