import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isSigninModalOpen: boolean;
  isSignupModalOpen: boolean;
  isLoading: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | null;
}

const initialState: UiState = {
  isSigninModalOpen: false,
  isSignupModalOpen: false,
  isLoading: false,
  toastMessage: null,
  toastType: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openSigninModal: (state) => {
      state.isSigninModalOpen = true;
      state.isSignupModalOpen = false;
    },
    openSignupModal: (state) => {
      state.isSignupModalOpen = true;
      state.isSigninModalOpen = false;
    },
    closeAuthModals: (state) => {
      state.isSigninModalOpen = false;
      state.isSignupModalOpen = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type;
    },
    hideToast: (state) => {
      state.toastMessage = null;
      state.toastType = null;
    },
  },
});

export const {
  openSigninModal,
  openSignupModal,
  closeAuthModals,
  setLoading,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;