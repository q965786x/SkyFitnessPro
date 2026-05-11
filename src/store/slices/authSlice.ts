import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMe, loginUser, logoutUser, registerUser } from '@/services/api/authApi';
import { storage } from '@/services/storage';


type AuthState = {
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
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      await loginUser({ email, password });

      const userResponse = await getMe();
      const userData = userResponse.data;
    
      const user = {
        name: userData.email.split('@')[0],
        email: userData.email,
      };
      storage.setUser(user);
    
      return user;
    } catch (error: unknown) {
      let errorMessage = 'Ошибка входа. Проверьте email и пароль';

      if (error instanceof Error) {
        const message = error.message;

        if (message === 'Неверный пароль') {
          errorMessage = 'Пароль введен неверно, попробуйте еще раз.';
        } else if (message === 'Пользователь с таким email не найден') {
          errorMessage = 'Пользователь с таким email не найден';
        } else {
          errorMessage = message;
        }
      }

      return rejectWithValue(errorMessage);
    }    
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
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
    } catch (error: unknown) {
      let errorMessage = 'Ошибка регистрации. Попробуйте позже';

      if (error instanceof Error) {
        // Проверяем на известные сообщения об ошибках из документации
        if (error.message === 'Пользователь с таким email уже существует') {
          errorMessage = 'Пользователь с таким email уже существует';
        } else if (error.message === 'Введите корректный Email') {
          errorMessage = 'Введите корректный Email';
        } else if (error.message === 'Пароль должен содержать не менее 6 симоволов') {
          errorMessage = 'Пароль должен содержать не менее 6 символов';
        } else if (error.message === 'Пароль должен содержать не менее 2 спецсимволов') {
          errorMessage = 'Пароль должен содержать не менее 2 спецсимволов';
        } else if (error.message === 'Пароль должен содержать как минимум одну заглавную букву') {
          errorMessage = 'Пароль должен содержать как минимум одну заглавную букву';
        } else {
          errorMessage = error.message;
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const checkAuth = createAsyncThunk('auth/check', async (_, { rejectWithValue }) => {
  const token = storage.getToken();
  if (!token) {
    return rejectWithValue('No token');
  }

  const storedUser = storage.getUser();
  if (storedUser) {    
    setTimeout(() => {
      getMe().catch(() => {        
      });
    }, 0);
    return storedUser;
  }
  
  try {
    const response = await getMe();
    const userData = response.data;
    return {
      name: userData.email.split('@')[0],
      email: userData.email,
    };
  } catch (error: unknown) {
    let errorMessage = 'Auth failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
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
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка входа. Проверьте email и пароль';
      })
      
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthorized = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка регистрации';
      })
      
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthorized = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthorized = false;
        state.user = null;
        state.error = null;
      })      
      
      .addCase(logout.fulfilled, (state) => {
        state.isAuthorized = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;