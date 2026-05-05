import progressReducer, { 
  clearProgressCache, 
  updateLocalProgress 
} from './progressSlice';

describe('progressSlice', () => {
  const initialState = {
    courseProgress: {},
    workoutProgress: {},
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle initial state', () => {
      expect(progressReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle updateLocalProgress', () => {
      const payload = {
        courseId: 'course1',
        workoutId: 'workout1',
        progressData: [10, 20, 30],
        workoutCompleted: false,
      };

      const nextState = progressReducer(initialState, updateLocalProgress(payload));
      const key = 'course1_workout1';
      
      expect(nextState.workoutProgress[key]).toEqual({
        workoutId: 'workout1',
        workoutCompleted: false,
        progressData: [10, 20, 30],
      });
    });

    it('should save progress to localStorage', () => {
      const payload = {
        courseId: 'course1',
        workoutId: 'workout1',
        progressData: [5, 10, 15],
        workoutCompleted: true,
      };

      progressReducer(initialState, updateLocalProgress(payload));
      
      const savedProgress = JSON.parse(localStorage.getItem('updatedWorkouts') || '{}');
      expect(savedProgress['course1_workout1']).toEqual({
        progressData: [5, 10, 15],
        workoutCompleted: true,
        timestamp: expect.any(Number),
      });
    });

    it('should handle clearProgressCache', () => {
      const stateWithProgress = {
        ...initialState,
        courseProgress: { 
          course1: { 
            courseId: 'course1', 
            courseCompleted: false, 
            workoutsProgress: [] 
          } 
        },
        workoutProgress: { 
          'course1_workout1': { 
            workoutId: 'workout1', 
            workoutCompleted: false, 
            progressData: [0] 
          } 
        },
      };

      const nextState = progressReducer(stateWithProgress, clearProgressCache());
      
      expect(nextState.courseProgress).toEqual({});
      expect(nextState.workoutProgress).toEqual({});
    });

    it('should update existing workout progress', () => {
      const firstPayload = {
        courseId: 'course1',
        workoutId: 'workout1',
        progressData: [10, 20, 30],
        workoutCompleted: false,
      };

      let state = progressReducer(initialState, updateLocalProgress(firstPayload));
      
      const secondPayload = {
        courseId: 'course1',
        workoutId: 'workout1',
        progressData: [50, 60, 70],
        workoutCompleted: true,
      };

      state = progressReducer(state, updateLocalProgress(secondPayload));
      const key = 'course1_workout1';
      
      // Добавляем проверку на существование объекта
      const updatedProgress = state.workoutProgress[key];
      expect(updatedProgress).toBeDefined();
      expect(updatedProgress?.progressData).toEqual([50, 60, 70]);
      expect(updatedProgress?.workoutCompleted).toBe(true);
    });
  });
});