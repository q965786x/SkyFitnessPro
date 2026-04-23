// Общее хранилище пользователей
export const users = new Map();

// Добавляем тестового пользователя
users.set('test@example.com', {
  email: 'test@example.com',
  password: 'Test123!@',
  selectedCourses: ['1', '2'],
});