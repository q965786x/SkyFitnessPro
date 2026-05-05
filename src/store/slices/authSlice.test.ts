import authReducer, { 
  clearError, 
  login, 
  logout,
  checkAuth,
  register 
} from './authSlice';

jest.mock('@/services/api/authApi');
jest.mock('@/services/storage');

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthorized: false,
    isLoading: false,
    error: null,
  };

  const mockUser = {
    name: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      };
      const nextState = authReducer(stateWithError, clearError());
      expect(nextState.error).toBeNull();
    });
  });

  describe('login thunk', () => {
    it('should handle pending state', () => {
      const action = { type: login.pending.type };
      const nextState = authReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(true);
      expect(nextState.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const action = { type: login.fulfilled.type, payload: mockUser };
      const nextState = authReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(false);
      expect(nextState.isAuthorized).toBe(true);
      expect(nextState.user).toEqual(mockUser);
    });

    it('should handle rejected state', () => {
      const action = { 
        type: login.rejected.type, 
        error: { message: 'Login failed' } 
      };
      const nextState = authReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(false);
      expect(nextState.error).toBe('Login failed');
      expect(nextState.isAuthorized).toBe(false);
    });
  });

  describe('register thunk', () => {
    it('should handle pending state', () => {
      const action = { type: register.pending.type };
      const nextState = authReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(true);
      expect(nextState.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const action = { type: register.fulfilled.type, payload: mockUser };
      const nextState = authReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(false);
      expect(nextState.isAuthorized).toBe(true);
      expect(nextState.user).toEqual(mockUser);
    });

    it('should handle rejected state', () => {
      const action = { 
        type: register.rejected.type, 
        error: { message: 'Registration failed' } 
      };
      const nextState = authReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(false);
      expect(nextState.error).toBe('Registration failed');
      expect(nextState.isAuthorized).toBe(false);
    });
  });

  describe('checkAuth thunk', () => {
    it('should handle pending state', () => {
      const action = { type: checkAuth.pending.type };
      const nextState = authReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(true);
    });

    it('should handle fulfilled state', () => {
      const action = { type: checkAuth.fulfilled.type, payload: mockUser };
      const nextState = authReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(false);
      expect(nextState.isAuthorized).toBe(true);
      expect(nextState.user).toEqual(mockUser);
    });

    it('should handle rejected state', () => {
      const action = { type: checkAuth.rejected.type };
      const nextState = authReducer(initialState, action);
      
      expect(nextState.isLoading).toBe(false);
      expect(nextState.isAuthorized).toBe(false);
      expect(nextState.user).toBeNull();
    });
  });

  describe('logout thunk', () => {
    it('should handle fulfilled state', () => {
      const loggedInState = {
        ...initialState,
        isAuthorized: true,
        user: mockUser,
      };
      
      const action = { type: logout.fulfilled.type, payload: null };
      const nextState = authReducer(loggedInState, action);
      
      expect(nextState.isAuthorized).toBe(false);
      expect(nextState.user).toBeNull();
    });
  });
});