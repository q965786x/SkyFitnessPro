'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 20px',
          fontSize: '14px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#BCEC30',
            secondary: '#000000',
          },
          style: {
            background: '#1E1E1E',
            color: '#FFFFFF',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#FF4444',
            color: '#FFFFFF',
          },
        },
        loading: {
          duration: Infinity,
          style: {
            background: '#363636',
            color: '#FFFFFF',
          },
        },
      }}
    />
  );
}