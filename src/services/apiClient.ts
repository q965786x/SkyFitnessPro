import axios from 'axios';
import { BASE_URL } from './constants';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления токена к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    // Проверяем, что код выполняется в браузере
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('Token being sent:', token ? 'Yes' : 'No');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set:', config.headers.Authorization);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерсептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка 401 (неавторизован)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userCoursesIds');
        // Перенаправляем на страницу входа, если не уже там
        if (!window.location.pathname.includes('/auth/signin')) {
          window.location.href = '/auth/signin';
        }
      }
    }
    
    // Формирование понятного сообщения об ошибке
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const message = error.response.data?.message || 'Что-то пошло не так';
      throw new Error(message);
    } else if (error.request) {
      // Запрос был сделан, но ответа нет
      throw new Error('Не удалось подключиться к серверу. Проверьте соединение.');
    } else {
      // Ошибка при настройке запроса
      throw new Error(error.message || 'Произошла ошибка при выполнении запроса');
    }
  }
);

export default apiClient;