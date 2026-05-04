import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getCourseProgressById, 
  getWorkoutProgress,
  saveWorkoutProgress,
  resetWorkoutProgress,
  getWorkoutById,    
} from '@/services/api/coursesApi';
import { CourseProgressType, WorkoutProgressType } from '@/sharedTypes/sharedTypes';


interface ProgressState {
  courseProgress: Record<string, CourseProgressType | null>;
  workoutProgress: Record<string, WorkoutProgressType | null>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  courseProgress: {},
  workoutProgress: {},
  isLoading: false,
  error: null,
};

export const fetchCourseProgress = createAsyncThunk(
  'progress/fetchCourse',
  async (courseId: string) => {
    const progress = await getCourseProgressById(courseId);
    return { courseId, progress };
  }
);

export const fetchWorkoutProgress = createAsyncThunk(
  'progress/fetchWorkout',
  async ({ courseId, workoutId }: { courseId: string; workoutId: string }) => {
    const progress = await getWorkoutProgress(courseId, workoutId);
    return { courseId, workoutId, progress };
  }
);

export const fetchWorkoutById = createAsyncThunk(
  'progress/fetchWorkoutById',
  async (workoutId: string) => {
    const workout = await getWorkoutById(workoutId);
    return workout;
  }
);

export const saveWorkout = createAsyncThunk(
  'progress/saveWorkout',
  async ({ courseId, workoutId, progressData }: { 
    courseId: string; 
    workoutId: string; 
    progressData: number[];
  }) => {
    await saveWorkoutProgress(courseId, workoutId, progressData);
    const allCompleted = progressData.every(count => count > 0);

    console.log('Saving workout to Redux:', { courseId, workoutId, progressData, allCompleted });
    
    // Дополнительно сохраняем в localStorage для синхронизации
    const key = `${courseId}_${workoutId}`;
    const updatedWorkouts = JSON.parse(localStorage.getItem('updatedWorkouts') || '{}');
    updatedWorkouts[key] = {
        progressData,
        workoutCompleted: allCompleted,
        timestamp: Date.now()
    };
    localStorage.setItem('updatedWorkouts', JSON.stringify(updatedWorkouts));

    return { courseId, workoutId, progressData, workoutCompleted: allCompleted };
  }
);

export const resetWorkout = createAsyncThunk(
  'progress/resetWorkout',
  async ({ courseId, workoutId }: { courseId: string; workoutId: string }) => {
    await resetWorkoutProgress(courseId, workoutId);
    return { courseId, workoutId };
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearProgressCache: (state) => {
      state.courseProgress = {};
      state.workoutProgress = {};
    },
    updateLocalProgress: (state, action: PayloadAction<{
      courseId: string;
      workoutId: string;
      progressData: number[];
      workoutCompleted: boolean;
    }>) => {
      const { courseId, workoutId, progressData, workoutCompleted } = action.payload;
      const key = `${courseId}_${workoutId}`;
      state.workoutProgress[key] = {
        workoutId,
        workoutCompleted,
        progressData,
      };
      
      // Обновляем кэш в localStorage для синхронизации
      const updatedWorkouts = JSON.parse(localStorage.getItem('updatedWorkouts') || '{}');
      updatedWorkouts[key] = {
        progressData,
        workoutCompleted,
        timestamp: Date.now()
      };
      localStorage.setItem('updatedWorkouts', JSON.stringify(updatedWorkouts));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseProgress.fulfilled, (state, action) => {
        state.courseProgress[action.payload.courseId] = action.payload.progress;
      })
      .addCase(fetchWorkoutProgress.fulfilled, (state, action) => {
        const key = `${action.payload.courseId}_${action.payload.workoutId}`;
        state.workoutProgress[key] = action.payload.progress;
      })
      .addCase(saveWorkout.fulfilled, (state, action) => {
        const { courseId, workoutId, progressData, workoutCompleted } = action.payload;
        const key = `${courseId}_${workoutId}`;
        state.workoutProgress[key] = {
          workoutId,
          workoutCompleted,
          progressData,
        };
      });
  },
});

export const { clearProgressCache, updateLocalProgress } = progressSlice.actions;
export default progressSlice.reducer;