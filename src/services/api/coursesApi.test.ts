import { 
  getAllCourses,
  getCourseById,
  getWorkoutById,
  getCourseProgressById,
  addCourseToUser,
  deleteCourseFromUser,
  getCourseWorkouts,
  saveWorkoutProgress,
  getUserCourses
} from './coursesApi';
import { storage } from '@/services/storage';
import { BASE_URL } from '@/services/constants';

// Мокируем fetch
global.fetch = jest.fn();

// Мокируем storage
jest.mock('@/services/storage');

describe('coursesApi', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    (storage.getToken as jest.Mock).mockReturnValue(mockToken);
    (storage.getUserCoursesIds as jest.Mock).mockReturnValue([]);
  });

  describe('Public endpoints', () => {
    describe('getAllCourses', () => {
      it('should successfully fetch all courses', async () => {
        const mockCourses = [
          { _id: '1', nameRU: 'Йога', nameEN: 'Yoga' },
          { _id: '2', nameRU: 'Фитнес', nameEN: 'Fitness' },
        ];
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockCourses,
        });

        const result = await getAllCourses();
        
        expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/courses`, {});
        expect(result).toEqual(mockCourses);
      });

      it('should return empty array on network error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await getAllCourses();
        
        expect(result).toEqual([]);
      });

      it('should return empty array if response is not array', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Not an array' }),
        });

        const result = await getAllCourses();
        
        expect(result).toEqual([]);
      });
    });

    describe('getCourseById', () => {
      it('should successfully fetch course by id', async () => {
        const mockCourse = { _id: '1', nameRU: 'Йога', nameEN: 'Yoga' };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockCourse,
        });

        const result = await getCourseById('1');
        
        expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/courses/1`, {});
        expect(result).toEqual(mockCourse);
      });

      it('should return null if course not found', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => null,
        });

        const result = await getCourseById('invalid');
        
        expect(result).toBeNull();
      });

      it('should return null on error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await getCourseById('1');
        
        expect(result).toBeNull();
      });
    });
  });

  describe('Authenticated endpoints', () => {
    describe('getWorkoutById', () => {
      it('should successfully fetch workout by id', async () => {
        const mockWorkout = { _id: '1', name: 'Morning Yoga', video: 'url', exercises: [] };
        
        // Мокаем response с методами clone и text
        const mockResponse = {
          ok: true,
          clone: () => mockResponse,
          text: async () => JSON.stringify(mockWorkout),
        };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await getWorkoutById('1');
        
        expect(global.fetch).toHaveBeenCalledWith(
          `${BASE_URL}/workouts/1`,
          expect.objectContaining({
            headers: { 'Authorization': `Bearer ${mockToken}` },
          })
        );
        expect(result).toEqual(mockWorkout);
      });

      it('should return null if no token', async () => {
        (storage.getToken as jest.Mock).mockReturnValue(null);

        const result = await getWorkoutById('1');
        
        expect(result).toBeNull();
      });
    });

    describe('getCourseProgressById', () => {
      it('should successfully fetch course progress', async () => {
        const mockProgress = {
          courseId: '1',
          courseCompleted: false,
          workoutsProgress: [],
        };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockProgress,
        });

        const result = await getCourseProgressById('1');
        
        expect(global.fetch).toHaveBeenCalledWith(
          `${BASE_URL}/users/me/progress?courseId=1`,
          expect.objectContaining({
            headers: { 'Authorization': `Bearer ${mockToken}` },
          })
        );
        expect(result).toEqual(mockProgress);
      });
    });

    describe('addCourseToUser', () => {
      it('should successfully add course to user', async () => {
        const mockResponse = { message: 'Course added' };
        (storage.getUserCoursesIds as jest.Mock).mockReturnValue(['course1']);
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await addCourseToUser('course2');
        
        expect(global.fetch).toHaveBeenCalledWith(
          `${BASE_URL}/users/me/courses`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ courseId: 'course2' }),
          })
        );
        expect(storage.setUserCoursesIds).toHaveBeenCalledWith(['course1', 'course2']);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteCourseFromUser', () => {
      it('should successfully delete course from user', async () => {
        const mockResponse = { message: 'Course deleted' };
        (storage.getUserCoursesIds as jest.Mock).mockReturnValue(['course1', 'course2', 'course3']);
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await deleteCourseFromUser('course2');
        
        expect(global.fetch).toHaveBeenCalledWith(
          `${BASE_URL}/users/me/courses/course2`,
          expect.objectContaining({
            method: 'DELETE',
          })
        );
        expect(storage.setUserCoursesIds).toHaveBeenCalledWith(['course1', 'course3']);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getCourseWorkouts', () => {
      it('should successfully fetch course workouts', async () => {
        const mockWorkouts = [
          { _id: '1', name: 'Workout 1', video: 'url', exercises: [] },
          { _id: '2', name: 'Workout 2', video: 'url', exercises: [] },
        ];
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockWorkouts,
        });

        const result = await getCourseWorkouts('course1');
        
        expect(result).toEqual(mockWorkouts);
      });
    });

    describe('saveWorkoutProgress', () => {
      const progressData = [10, 15, 20];

      it('should successfully save workout progress', async () => {
        const mockResponse = { message: 'Progress saved' };
        
        // Мокаем response с методом clone
        const mockResponseWithClone = {
          ok: true,
          clone: () => ({
            json: async () => mockResponse,
          }),
        };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponseWithClone);

        const result = await saveWorkoutProgress('course1', 'workout1', progressData);
        
        expect(global.fetch).toHaveBeenCalledWith(
          `${BASE_URL}/courses/course1/workouts/workout1`,
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ progressData }),
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getUserCourses', () => {
      it('should return cached courses if available', async () => {
        const cachedCourses = ['course1', 'course2'];
        (storage.getUserCoursesIds as jest.Mock).mockReturnValue(cachedCourses);

        const result = await getUserCourses();
        
        expect(result).toEqual(cachedCourses);
        expect(global.fetch).not.toHaveBeenCalled();
      });

      it('should fetch user courses from API if no cache', async () => {
        (storage.getUserCoursesIds as jest.Mock).mockReturnValue([]);
        
        const mockResponse = {
          user: {
            selectedCourses: ['course1', 'course2', 'course3'],
          },
        };
        
        const mockResponseWithClone = {
          ok: true,
          clone: () => ({
            json: async () => mockResponse,
          }),
        };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponseWithClone);

        const result = await getUserCourses();
        
        expect(global.fetch).toHaveBeenCalledWith(
          `${BASE_URL}/users/me`,
          expect.objectContaining({
            headers: { 'Authorization': `Bearer ${mockToken}` },
          })
        );
        expect(result).toEqual(['course1', 'course2', 'course3']);
        expect(storage.setUserCoursesIds).toHaveBeenCalledWith(['course1', 'course2', 'course3']);
      });
    });
  });
});