import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMe, loginUser, logoutUser, registerUser } from '@/services/api/authApi';
import { storage } from '@/services/storage';


interface AuthState {
  user: { name: string; email: string } | null;
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthorized: false,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    await loginUser({ email, password });

    const userResponse = await getMe();
    const userData = userResponse.data;
    
    const user = {
      name: userData.email.split('@')[0],
      email: userData.email,
    };
    storage.setUser(user);
    
    return user;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }) => {
    await registerUser({ email, password });
    await loginUser({ email, password });

    const userResponse = await getMe();
    const userData = userResponse.data;
    
    const user = {
      name: userData.email.split('@')[0],
      email: userData.email,
    };
    storage.setUser(user);
    
    return user;
  }
);

export const checkAuth = createAsyncThunk('auth/check', async () => {
  const token = storage.getToken();
  if (!token) {
    throw new Error('No token');
  }
  const response = await getMe();
  const userData = response.data;
  return {
    name: userData.email.split('@')[0],
    email: userData.email,
  };
});

export const logout = createAsyncThunk('auth/logout', async () => {
  logoutUser();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthorized = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка входа';
      })
      
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthorized = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка регистрации';
      })
      
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthorized = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthorized = false;
        state.user = null;
      })      
      
      .addCase(logout.fulfilled, (state) => {
        state.isAuthorized = false;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;