import jwt from 'jsonwebtoken';

// Секретный ключ для JWT
const JWT_SECRET = 'your-secret-key';

// Типы данных
type User = {
  id: string;
  email: string;
  password: string;
  selectedCourses: string[];
};

type Course = {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  difficulty: string;
  durationInDays: number;
  dailyDurationInMinutes: { from: number; to: number };
  workouts: string[];
};

type WorkoutData = {
  _id: string;
  name: string;
  video: string;
  exercises: Exercise[];
};

type Exercise = {
  _id: string;
  name: string;
  quantity: number;
};

type WorkoutProgress = {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
};

type CourseProgress = {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: WorkoutProgress[];
};

// ========== Хранилища данных (в реальном проекте замените на БД) ==========
const users = new Map<string, User>();
const courses: Course[] = [
  {
    _id: '1',
    nameRU: 'Йога',
    nameEN: 'Yoga',
    description: 'Йога для начинающих и продолжающих. Улучшите гибкость, снимите стресс и обретите гармонию.',
    directions: ['Йога для новичков', 'Классическая йога', 'Кундалини-йога', 'Йогатерапия', 'Хатха-йога', 'Аштанга-йога'],
    fitting: ['Давно хотели попробовать йогу, но не решались начать', 'Хотите укрепить позвоночник, избавиться от болей в спине и суставах', 'Ищете активность, полезную для тела и души'],
    difficulty: 'средний',
    durationInDays: 25,
    dailyDurationInMinutes: { from: 20, to: 40 },
    workouts: ['1', '2', '3', '4', '5'],
  },
  {
    _id: '2',
    nameRU: 'Стретчинг',
    nameEN: 'Stretching',
    description: 'Растяжка всего тела для улучшения гибкости и подвижности суставов.',
    directions: ['Динамический', 'Статический', 'Парный'],
    fitting: ['Сидячая работа', 'Малоактивный образ жизни', 'Желание улучшить гибкость'],
    difficulty: 'легкий',
    durationInDays: 20,
    dailyDurationInMinutes: { from: 15, to: 30 },
    workouts: ['6', '7', '8'],
  },
  {
    _id: '3',
    nameRU: 'Фитнес',
    nameEN: 'Fitness',
    description: 'Интенсивные тренировки для похудения и укрепления мышц.',
    directions: ['Кардио', 'Силовой', 'HIIT'],
    fitting: ['Хорошая подготовка', 'Желание похудеть', 'Энергичные люди'],
    difficulty: 'сложный',
    durationInDays: 30,
    dailyDurationInMinutes: { from: 30, to: 60 },
    workouts: ['9', '10', '11'],
  },
  {
    _id: '4',
    nameRU: 'Степ-аэробика',
    nameEN: 'StepAerobics',
    description: 'Динамичные тренировки на степ-платформе для сжигания калорий и укрепления сердечно-сосудистой системы.',
    directions: ['Базовый', 'Продвинутый', 'Танцевальный'],
    fitting: ['Любители активного образа жизни', 'Желание похудеть', 'Укрепление сердца'],
    difficulty: 'средний',
    durationInDays: 28,
    dailyDurationInMinutes: { from: 25, to: 45 },
    workouts: ['12', '13', '14'],
  },
  {
    _id: '5',
    nameRU: 'Бодифлекс',
    nameEN: 'Bodyflex',
    description: 'Дыхательная гимнастика с элементами растяжки для похудения и оздоровления организма.',
    directions: ['Диафрагмальное дыхание', 'Изометрические упражнения', 'Растяжка'],
    fitting: ['Начинающие', 'Проблемные зоны', 'Желание похудеть без нагрузок'],
    difficulty: 'легкий',
    durationInDays: 15,
    dailyDurationInMinutes: { from: 15, to: 25 },
    workouts: ['15', '16', '17'],
  },
];

const workouts: Record<string, WorkoutData> = {
  // Йога (1-5)
  '1': {
    _id: '1',
    name: 'Урок 1. Основы йоги',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e1', name: 'Собака мордой вниз', quantity: 10 },
      { _id: 'e2', name: 'Кошка-корова', quantity: 15 },
      { _id: 'e3', name: 'Поза ребенка', quantity: 5 },
    ],
  },
  '2': {
    _id: '2',
    name: 'Урок 2. Утренняя практика',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e4', name: 'Приветствие солнцу', quantity: 12 },
      { _id: 'e5', name: 'Воины', quantity: 8 },
    ],
  },
  '3': {
    _id: '3',
    name: 'Урок 3. Расслабление',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e6', name: 'Шавасана', quantity: 3 },
    ],
  },
  '4': {
    _id: '4',
    name: 'Урок 4. Баланс',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e7', name: 'Поза дерева', quantity: 8 },
      { _id: 'e8', name: 'Поза орла', quantity: 6 },
    ],
  },
  '5': {
    _id: '5',
    name: 'Урок 5. Медитация',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e9', name: 'Дыхание', quantity: 10 },
    ],
  },
  // Стретчинг (6-8)
  '6': {
    _id: '6',
    name: 'Урок 1. Растяжка ног',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e10', name: 'Наклоны к ногам', quantity: 20 },
      { _id: 'e11', name: 'Бабочка', quantity: 15 },
    ],
  },
  '7': {
    _id: '7',
    name: 'Урок 2. Растяжка спины',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e12', name: 'Складка', quantity: 15 },
    ],
  },
  '8': {
    _id: '8',
    name: 'Урок 3. Растяжка рук',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e13', name: 'Растяжка трицепса', quantity: 12 },
    ],
  },
  // Фитнес (9-11)
  '9': {
    _id: '9',
    name: 'Урок 1. Кардио',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e14', name: 'Бёрпи', quantity: 20 },
      { _id: 'e15', name: 'Прыжки', quantity: 50 },
    ],
  },
  '10': {
    _id: '10',
    name: 'Урок 2. Силовая',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e16', name: 'Отжимания', quantity: 15 },
      { _id: 'e17', name: 'Приседания', quantity: 25 },
    ],
  },
  '11': {
    _id: '11',
    name: 'Урок 3. HIIT',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e18', name: 'Бег на месте', quantity: 60 },
      { _id: 'e19', name: 'Выпады', quantity: 20 },
    ],
  },
  // Степ-аэробика (12-14)
  '12': {
    _id: '12',
    name: 'Урок 1. Базовые шаги',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e20', name: 'Basic Step', quantity: 30 },
      { _id: 'e21', name: 'V-Step', quantity: 20 },
      { _id: 'e22', name: 'Knee Up', quantity: 25 },
    ],
  },
  '13': {
    _id: '13',
    name: 'Урок 2. Комбинации',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e23', name: 'Over the Top', quantity: 20 },
      { _id: 'e24', name: 'Turn Step', quantity: 15 },
      { _id: 'e25', name: 'L-Step', quantity: 15 },
    ],
  },
  '14': {
    _id: '14',
    name: 'Урок 3. Интенсив',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e26', name: 'Power Step', quantity: 25 },
      { _id: 'e27', name: 'Jumping Jacks on Step', quantity: 30 },
      { _id: 'e28', name: 'Pendulum', quantity: 20 },
    ],
  },
  // Бодифлекс (15-17)
  '15': {
    _id: '15',
    name: 'Урок 1. Дыхательная гимнастика',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e29', name: 'Диафрагмальное дыхание', quantity: 10 },
      { _id: 'e30', name: 'Основное дыхательное упражнение', quantity: 8 },
    ],
  },
  '16': {
    _id: '16',
    name: 'Урок 2. Изометрические позы',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e31', name: 'Лев', quantity: 6 },
      { _id: 'e32', name: 'Сейко', quantity: 8 },
      { _id: 'e33', name: 'Лодочка', quantity: 6 },
    ],
  },
  '17': {
    _id: '17',
    name: 'Урок 3. Растяжка в движении',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    exercises: [
      { _id: 'e34', name: 'Наклоны в стороны', quantity: 10 },
      { _id: 'e35', name: 'Скручивания', quantity: 10 },
      { _id: 'e36', name: 'Растяжка ног', quantity: 8 },
    ],
  },
};

// Хранилище прогресса пользователей
const userProgress = new Map<string, Record<string, CourseProgress>>();

// Добавляем тестового пользователя
users.set('test@example.com', {
  id: '1',
  email: 'test@example.com',
  password: 'Test123!@',
  selectedCourses: ['1', '2'],
});

// ========== Функции аутентификации ==========
export const registerUser = async ({ email, password }: { email: string; password: string }) => {
  // Проверка на существующего пользователя
  if (users.has(email)) {
    throw new Error('Пользователь с таким email уже существует');
  }

  // Валидация пароля
  if (password.length < 6) {
    throw new Error('Пароль должен содержать не менее 6 символов');
  }

  const specialChars = password.match(/[!@#$%^&*(),.?":{}|<>]/g);
  if (!specialChars || specialChars.length < 2) {
    throw new Error('Пароль должен содержать не менее 2 спецсимволов');
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('Пароль должен содержать как минимум одну заглавную букву');
  }

  // Создаем нового пользователя
  const newUser: User = {
    id: Date.now().toString(),
    email,
    password,
    selectedCourses: [],
  };

  users.set(email, newUser);
  console.log('User registered:', email);
  console.log('All users:', Array.from(users.keys()));
};

export const loginUser = async ({ email, password }: { email: string; password: string }) => {
  const user = users.get(email);
  
  if (!user) {
    throw new Error('Пользователь с таким email не найден');
  }
  
  if (user.password !== password) {
    throw new Error('Неверный пароль');
  }
  
  // Создаем JWT токен
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return token;
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export const getUserByToken = async (token: string) => {
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new Error('Невалидный токен');
  }
  
  // Ищем пользователя по id
  let foundUser: User | undefined;
  for (const user of users.values()) {
    if (user.id === decoded.id) {
      foundUser = user;
      break;
    }
  }
  
  if (!foundUser) {
    throw new Error('Пользователь не найден');
  }
  
  return {
    email: foundUser.email,
    selectedCourses: foundUser.selectedCourses,
  };
};

// ========== Функции курсов ==========
export const getAllCourses = async () => {
  return courses;
};

export const getCourseById = async (courseId: string) => {
  const course = courses.find(c => c._id === courseId);
  if (!course) {
    throw new Error('Курс не найден');
  }
  return course;
};

// ========== Функции управления курсами пользователя ==========
export const addCourseToUser = async (userId: string, courseId: string) => {
  // Находим пользователя по id
  let user: User | undefined;
  for (const u of users.values()) {
    if (u.id === userId) {
      user = u;
      break;
    }
  }
  
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  
  if (!user.selectedCourses.includes(courseId)) {
    user.selectedCourses.push(courseId);
  }
  
  // Инициализируем прогресс для курса
  const course = await getCourseById(courseId);
  if (!userProgress.has(user.id)) {
    userProgress.set(user.id, {});
  }
  
  const userProgressData = userProgress.get(user.id)!;
  if (!userProgressData[courseId]) {
    userProgressData[courseId] = {
      courseId,
      courseCompleted: false,
      workoutsProgress: course.workouts.map(workoutId => ({
        workoutId,
        workoutCompleted: false,
        progressData: [],
      })),
    };
  }
};

export const deleteCourseFromUser = async (userId: string, courseId: string) => {
  let user: User | undefined;
  for (const u of users.values()) {
    if (u.id === userId) {
      user = u;
      break;
    }
  }
  
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  
  const index = user.selectedCourses.indexOf(courseId);
  if (index !== -1) {
    user.selectedCourses.splice(index, 1);
  }
  
  // Удаляем прогресс курса
  const userProgressData = userProgress.get(user.id);
  if (userProgressData) {
    delete userProgressData[courseId];
  }
};

// ========== Функции тренировок ==========
export const getWorkoutById = async (workoutId: string) => {
  const workout = workouts[workoutId];
  if (!workout) {
    throw new Error('Тренировка не найдена');
  }
  return workout;
};

// ========== Функции прогресса ==========
export const getWorkoutProgress = async (userId: string, courseId: string, workoutId: string) => {
  const userProgressData = userProgress.get(userId);
  if (!userProgressData || !userProgressData[courseId]) {
    return {
      workoutId,
      workoutCompleted: false,
      progressData: [],
    };
  }
  
  const courseProgress = userProgressData[courseId];
  const workoutProgress = courseProgress.workoutsProgress.find(w => w.workoutId === workoutId);
  
  if (!workoutProgress) {
    return {
      workoutId,
      workoutCompleted: false,
      progressData: [],
    };
  }
  
  return workoutProgress;
};

export const getAllWorkoutsProgress = async (userId: string, courseId: string) => {
  const userProgressData = userProgress.get(userId);
  if (!userProgressData || !userProgressData[courseId]) {
    const course = await getCourseById(courseId);
    return {
      courseId,
      courseCompleted: false,
      workoutsProgress: course.workouts.map(workoutId => ({
        workoutId,
        workoutCompleted: false,
        progressData: [],
      })),
    };
  }
  
  return userProgressData[courseId];
};

export const markWorkoutProgress = async (
  userId: string,
  courseId: string,
  workoutId: string,
  progressData: number[]
) => {
  // Инициализируем прогресс если его нет
  if (!userProgress.has(userId)) {
    userProgress.set(userId, {});
  }
  
  const userProgressData = userProgress.get(userId)!;
  
  if (!userProgressData[courseId]) {
    const course = await getCourseById(courseId);
    userProgressData[courseId] = {
      courseId,
      courseCompleted: false,
      workoutsProgress: course.workouts.map(wId => ({
        workoutId: wId,
        workoutCompleted: false,
        progressData: [],
      })),
    };
  }
  
  const courseProgress = userProgressData[courseId];
  const workoutIndex = courseProgress.workoutsProgress.findIndex(w => w.workoutId === workoutId);
  
  if (workoutIndex !== -1) {
    courseProgress.workoutsProgress[workoutIndex].progressData = progressData;
    courseProgress.workoutsProgress[workoutIndex].workoutCompleted = progressData.every(v => v > 0);
  }
  
  // Проверяем, завершен ли весь курс
  courseProgress.courseCompleted = courseProgress.workoutsProgress.every(w => w.workoutCompleted);
};

export const restartWorkoutForUser = async (userId: string, courseId: string, workoutId: string) => {
  const userProgressData = userProgress.get(userId);
  if (userProgressData && userProgressData[courseId]) {
    const courseProgress = userProgressData[courseId];
    const workoutIndex = courseProgress.workoutsProgress.findIndex(w => w.workoutId === workoutId);
    
    if (workoutIndex !== -1) {
      courseProgress.workoutsProgress[workoutIndex].progressData = [];
      courseProgress.workoutsProgress[workoutIndex].workoutCompleted = false;
    }
    
    courseProgress.courseCompleted = courseProgress.workoutsProgress.every(w => w.workoutCompleted);
  }
};

export const restartCourseForUser = async (userId: string, courseId: string) => {
  const userProgressData = userProgress.get(userId);
  if (userProgressData && userProgressData[courseId]) {
    const course = await getCourseById(courseId);
    userProgressData[courseId] = {
      courseId,
      courseCompleted: false,
      workoutsProgress: course.workouts.map(workoutId => ({
        workoutId,
        workoutCompleted: false,
        progressData: [],
      })),
    };
  }
};