import coursesReducer, {
  clearCurrentCourse,
  clearError,
  fetchAllCourses,
  fetchUserCourses,
  fetchCourseById,
  fetchCourseWorkouts,
  addCourse,
  deleteCourse,
} from './coursesSlice';

describe('coursesSlice', () => {
  const initialState = {
    allCourses: [],
    userCoursesIds: [],
    currentCourse: null,
    courseWorkouts: {},
    isLoading: false,
    error: null,
  };

  const mockCourse = {
    _id: 'course1',
    nameRU: 'Йога',
    nameEN: 'Yoga',
    description: 'Test description',
    directions: ['Направление 1'],
    fitting: ['Для начинающих'],
    difficulty: 'Средний',
    durationInDays: 30,
    dailyDurationInMinutes: { from: 20, to: 40 },
    workouts: ['workout1', 'workout2'],
  };

  const mockWorkouts = [
    { _id: 'workout1', name: 'Утренняя йога', video: 'url1', exercises: [] },
    { _id: 'workout2', name: 'Вечерняя йога', video: 'url2', exercises: [] },
  ];

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle initial state', () => {
      expect(coursesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearCurrentCourse', () => {
      const stateWithCourse = {
        ...initialState,
        currentCourse: mockCourse,
      };
      const nextState = coursesReducer(stateWithCourse, clearCurrentCourse());
      expect(nextState.currentCourse).toBeNull();
    });

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      };
      const nextState = coursesReducer(stateWithError, clearError());
      expect(nextState.error).toBeNull();
    });
  });

  describe('fetchAllCourses thunk', () => {
    it('should handle pending state', () => {
      const action = { type: fetchAllCourses.pending.type };
      const nextState = coursesReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(true);
      expect(nextState.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const mockCourses = [mockCourse];
      const action = { type: fetchAllCourses.fulfilled.type, payload: mockCourses };
      const nextState = coursesReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(false);
      expect(nextState.allCourses).toEqual(mockCourses);
    });

    it('should handle rejected state', () => {
      const action = { 
        type: fetchAllCourses.rejected.type, 
        error: { message: 'Network error' } 
      };
      const nextState = coursesReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(false);
      expect(nextState.error).toBe('Network error');
    });
  });

  describe('fetchUserCourses thunk', () => {
    it('should handle fulfilled state', () => {
      const userCourseIds = ['course1', 'course2', 'course3'];
      const action = { type: fetchUserCourses.fulfilled.type, payload: userCourseIds };
      const nextState = coursesReducer(initialState, action);
      
      expect(nextState.userCoursesIds).toEqual(userCourseIds);
    });
  });

  describe('fetchCourseById thunk', () => {
    it('should handle fulfilled state', () => {
      const action = { type: fetchCourseById.fulfilled.type, payload: mockCourse };
      const nextState = coursesReducer(initialState, action);
      
      expect(nextState.currentCourse).toEqual(mockCourse);
    });
  });

  describe('fetchCourseWorkouts thunk', () => {
    it('should handle fulfilled state', () => {
      const action = { 
        type: fetchCourseWorkouts.fulfilled.type, 
        payload: { courseId: 'course1', workouts: mockWorkouts } 
      };
      const nextState = coursesReducer(initialState, action);
      
      expect(nextState.courseWorkouts['course1']).toEqual(mockWorkouts);
    });
  });

  describe('addCourse thunk', () => {
    it('should handle fulfilled state - add new course', () => {
      const initialStateWithUserCourses = {
        ...initialState,
        userCoursesIds: ['course1', 'course2'],
      };
      
      const action = { type: addCourse.fulfilled.type, payload: 'course3' };
      const nextState = coursesReducer(initialStateWithUserCourses, action);
      
      expect(nextState.userCoursesIds).toContain('course3');
      expect(nextState.userCoursesIds.length).toBe(3);
    });

    it('should not add duplicate course', () => {
      const initialStateWithUserCourses = {
        ...initialState,
        userCoursesIds: ['course1', 'course2'],
      };
      
      const action = { type: addCourse.fulfilled.type, payload: 'course1' };
      const nextState = coursesReducer(initialStateWithUserCourses, action);
      
      expect(nextState.userCoursesIds).toEqual(['course1', 'course2']);
      expect(nextState.userCoursesIds.length).toBe(2);
    });
  });

  describe('deleteCourse thunk', () => {
    it('should handle fulfilled state', () => {
      const initialStateWithCourses = {
        ...initialState,
        userCoursesIds: ['course1', 'course2', 'course3'],
        courseWorkouts: {
          'course1': mockWorkouts,
          'course2': mockWorkouts,
          'course3': mockWorkouts,
        },
      };
      
      const action = { type: deleteCourse.fulfilled.type, payload: 'course2' };
      const nextState = coursesReducer(initialStateWithCourses, action);
      
      expect(nextState.userCoursesIds).toEqual(['course1', 'course3']);
      expect(nextState.userCoursesIds).not.toContain('course2');
      expect(nextState.courseWorkouts['course2']).toBeUndefined();
    });

    it('should handle rejected state - still remove from local state', () => {
      const initialStateWithCourses = {
        ...initialState,
        userCoursesIds: ['course1', 'course2', 'course3'],
        courseWorkouts: {
          'course1': mockWorkouts,
          'course2': mockWorkouts,
        },
      };
      
      const action = { 
        type: deleteCourse.rejected.type, 
        meta: { arg: 'course2' } 
      };
      const nextState = coursesReducer(initialStateWithCourses, action);
      
      expect(nextState.userCoursesIds).toEqual(['course1', 'course3']);
      expect(nextState.courseWorkouts['course2']).toBeUndefined();
    });
  });
});