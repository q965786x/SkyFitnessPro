import axios from 'axios';
import { registerUser, loginUser, getMe } from './authApi';
import { storage } from '@/services/storage';
import { BASE_URL } from '@/services/constants';

// Мокируем зависимости
jest.mock('axios');
jest.mock('@/services/storage');

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully register a user', async () => {
      const mockResponse = { data: { message: 'User registered successfully' } };
      (axios as unknown as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await registerUser(registerData);

      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: `${BASE_URL}/auth/register`,
        headers: { 'Content-Type': '' },
        data: {
          email: registerData.email.trim(),
          password: registerData.password,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle registration error', async () => {
      const mockError = new Error('Email already exists');
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(registerUser(registerData)).rejects.toThrow('Email already exists');
    });
  });

  describe('loginUser', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login and save token', async () => {
      const mockToken = 'test-token-123';
      const mockResponse = { data: { token: mockToken } };
      (axios as unknown as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await loginUser(loginData);

      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: `${BASE_URL}/auth/login`,
        headers: { 'Content-Type': '' },
        data: {
          email: loginData.email.trim(),
          password: loginData.password,
        },
      });
      expect(storage.setToken).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockResponse);
    });

    it('should handle login error', async () => {
      const mockError = new Error('Invalid credentials');
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(loginUser(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getMe', () => {
    const mockToken = 'valid-token';
    const mockEmail = 'test@example.com';

    beforeEach(() => {
      (storage.getToken as jest.Mock).mockReturnValue(mockToken);
    });

    it('should successfully get user data', async () => {
      const mockResponse = {
        data: {
          email: mockEmail,
          selectedCourses: ['course1', 'course2'],
        },
      };
      (axios as unknown as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getMe();

      expect(axios).toHaveBeenCalledWith({
        method: 'get',
        url: `${BASE_URL}/users/me`,
        headers: { 'Authorization': `Bearer ${mockToken}` },
      });
      expect(storage.setUser).toHaveBeenCalledWith({
        name: mockEmail.split('@')[0],
        email: mockEmail,
      });
      expect(result).toEqual({
        data: {
          email: mockEmail,
          selectedCourses: ['course1', 'course2'],
        },
      });
    });

    it('should throw error if no token found', async () => {
      (storage.getToken as jest.Mock).mockReturnValue(null);

      await expect(getMe()).rejects.toThrow('No token found');
    });

    it('should throw error if email not found in response', async () => {
      const mockResponse = { data: {} };
      (axios as unknown as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(getMe()).rejects.toThrow('Email не найден в ответе сервера');
    });
  });
});