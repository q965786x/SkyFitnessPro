import apiClient from './apiClient';
import { BASE_URL } from './constants';

// Типы данных API
export type Course = {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  difficulty: string;
  durationInDays: number;
  dailyDurationInMinutes: {
    from: number;
    to: number;
  };
  workouts: string[];
};

export type Workout = {
  _id: string;
  name: string;
  video: string;
  exercises: Exercise[];
};

export type Exercise = {
  _id: string;
  name: string;
  quantity: number;
};

export type CourseProgress = {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: WorkoutProgress[];
};

export type WorkoutProgress = {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
};

export type UserData = {
  email: string;
  selectedCourses: string[];
};

// ========== Аутентификация ==========
export const register = (email: string, password: string) => {
  return apiClient.post<{ message: string }>('/auth/register', { email, password });
};

export const login = (email: string, password: string) => {
  return apiClient.post<{ token: string }>('/auth/login', { email, password });
};

export const getMe = () => {
  return apiClient.get<UserData>('/users/me');
};

// ========== Курсы ==========
export const getAllCourses = () => {
  return apiClient.get<Course[]>('/courses');
};

export const getCourse = (courseId: string) => {
  return apiClient.get<Course>(`/courses/${courseId}`);
};

export const getUserCourses = async (): Promise<string[]> => {
  try {
    const response = await getMe();
    console.log('getUserCourses response:', response.data);
    return response.data.selectedCourses || [];
  } catch (error) {
    console.error('Error in getUserCourses:', error);
    return [];
  }
};

export const addCourseToUser = (courseId: string) => {
  return apiClient.post<{ message: string }>('/users/me/courses', { courseId });
};

export const deleteCourseFromUser = (courseId: string) => {
  return apiClient.delete<{ message: string }>(`/users/me/courses/${courseId}`);
};

export const resetCourseProgress = (courseId: string) => {
  return apiClient.patch<{ message: string }>(`/courses/${courseId}/reset`);
};

// ========== Тренировки ==========
export const getWorkout = (workoutId: string) => {
  return apiClient.get<Workout>(`/workouts/${workoutId}`);
};

export const getCourseWorkouts = (courseId: string) => {
  return apiClient.get<Workout[]>(`/courses/${courseId}/workouts`);
};

// ========== Прогресс ==========
export const getCourseProgress = (courseId: string) => {
  return apiClient.get<CourseProgress>(`/users/me/progress?courseId=${courseId}`);
};

export const getWorkoutProgress = (courseId: string, workoutId: string) => {
  return apiClient.get<WorkoutProgress>(`/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`);
};

export const saveWorkoutProgress = (courseId: string, workoutId: string, progressData: number[]) => {
  return apiClient.patch<{ message: string }>(`/courses/${courseId}/workouts/${workoutId}`, { progressData });
};

export const resetWorkoutProgress = (courseId: string, workoutId: string) => {
  return apiClient.patch<{ message: string }>(`/courses/${courseId}/workouts/${workoutId}/reset`);
};