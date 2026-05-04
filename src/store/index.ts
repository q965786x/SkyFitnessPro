'use client';

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import coursesReducer from './slices/coursesSlice';
import progressReducer from './slices/progressSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    progress: progressReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;