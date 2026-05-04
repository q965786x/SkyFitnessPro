import { 
    CourseProgressType, 
    CourseType, 
    WorkoutProgressType, 
    WorkoutType 
} from "@/sharedTypes/sharedTypes";
import { BASE_URL } from "../constants";
import { storage } from "../storage";

const pendingRequests = new Map();

// Вспомогательная функция для авторизованных fetch-запросов
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = storage.getToken();
    
    if (!token) {
        throw new Error('No token found');
    }
    
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Если такой запрос уже выполняется, возвращаем тот же промис
    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
    }
    
    const promise = fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    }).then(async (response) => {
        if (!response.ok) {
            // Не читаем response.json() здесь, чтобы не "загрязнять" body
            let errorMessage = `HTTP ${response.status}`;
            try {
                 // Клонируем response перед чтением
                const clonedResponse = response.clone();
                const error = await clonedResponse.json();
                errorMessage = error.message || error.error || errorMessage;
            } catch {
            // Не удалось прочитать JSON - игнорируем
            }
            throw new Error(errorMessage);
        }
        return response;
    }).finally(() => {
        // Удаляем из кэша через 100мс
        setTimeout(() => pendingRequests.delete(cacheKey), 100);
    });
    
    pendingRequests.set(cacheKey, promise);
    return promise;
}

// Вспомогательная функция для публичных fetch-запросов (без токена)
async function publicFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${BASE_URL}${url}`, options);
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }
    
    return response;
}

// ============ ПУБЛИЧНЫЕ ЭНДПОИНТЫ (не требуют токен) ============

// GET /api/fitness/courses
export const getAllCourses = async (): Promise<CourseType[]> => {
    console.log('Getting all courses');
    try {
        const response = await publicFetch('/courses');
        const data = await response.json();
        
        if (Array.isArray(data)) {
            return data;
        }
        
        console.error('Неожиданная структура ответа:', data);
        return [];
    } catch (error) {
        console.error('Ошибка загрузки курсов:', error);
        return [];
    }
};

// GET /api/fitness/courses/[courseId]
export const getCourseById = async (courseId: string): Promise<CourseType | null> => {
    console.log('Getting course:', courseId);
    try {
        const response = await publicFetch(`/courses/${courseId}`);
        const data = await response.json();
        
        if (data && data._id) {
            return data;
        }
        
        console.error('Неожиданная структура ответа курса:', data);
        return null;
    } catch (error) {
        console.error('Ошибка загрузки курса:', error);
        return null;
    }
};

// ============ ЗАЩИЩЕННЫЕ ЭНДПОИНТЫ (требуют токен) ============

// GET /api/fitness/workouts/[workoutId] (требует токен)
export const getWorkoutById = async (workoutId: string): Promise<WorkoutType | null> => {
    console.log('Getting workout:', workoutId);
    try {
        const response = await authFetch(`/workouts/${workoutId}`);
        
        // Клонируем response перед чтением, чтобы избежать проблем
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();

        if (!text) {
            console.error('Empty response body');
            return null;
        }
        
        const data = JSON.parse(text);
        
        if (data && data._id) {
            return data;
        }
        
        console.error('Неожиданная структура ответа тренировки:', data);
        return null;
    } catch (error) {
        console.error('Ошибка загрузки тренировки:', error);
        return null;
    }
};

// GET /api/fitness/users/me/progress?courseId={courseId} (требует токен)
export const getCourseProgressById = async (courseId: string): Promise<CourseProgressType | null> => {
    console.log('Getting course progress:', courseId);
    try {
        const response = await authFetch(`/users/me/progress?courseId=${courseId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка загрузки прогресса курса:', error);
        return null;
    }
};

// POST /api/fitness/users/me/courses (требует токен)
export const addCourseToUser = async (courseId: string): Promise<{ message: string }> => {
    console.log('Adding course to user:', courseId);
    const token = storage.getToken();
    
    if (!token) {
        throw new Error('No token');
    }
    
    try {
        const response = await authFetch('/users/me/courses', {
            method: 'POST',
            body: JSON.stringify({ courseId: courseId }),
        });
        
        const data = await response.json();
        
        // Обновляем кэш
        const currentCourses = storage.getUserCoursesIds();
        if (!currentCourses.includes(courseId)) {
            storage.setUserCoursesIds([...currentCourses, courseId]);
        }
        
        return data;
    } catch (error) {
        // Проверяем тип error и извлекаем сообщение
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Проверяем, не ошибка ли это "курс уже добавлен"
        if (errorMessage === 'Курс уже был добавлен!') {
            console.log('Course already added, skipping');
            return { message: 'Курс уже добавлен' };
        }
        
        console.error('Error adding course:', error);
        throw error;
    }
};

// DELETE /api/fitness/users/me/courses/[courseId] (требует токен)
export const deleteCourseFromUser = async (courseId: string): Promise<{ message: string }> => {
    console.log('Deleting course from user:', courseId);
    try {
        const response = await authFetch(`/users/me/courses/${courseId}`, {
            method: 'DELETE',
        });
        
        const data = await response.json();
        
        const currentCourses = storage.getUserCoursesIds();
        storage.setUserCoursesIds(currentCourses.filter(id => id !== courseId));
        
        return data;
    } catch (error) {
        // Проверяем, не ошибка ли это "курс не был добавлен"
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage === 'У пользователя не был добавлен этот курс!') {
            console.log('Course was not in user list, removing from local storage anyway');
            // Всё равно удаляем из localStorage
            const currentCourses = storage.getUserCoursesIds();
            storage.setUserCoursesIds(currentCourses.filter(id => id !== courseId));
            return { message: 'Курс удалён из локального списка' };
        }
        console.error('Ошибка удаления курса:', error);
        throw error;
    }
};

// GET /api/fitness/courses/[courseId]/workouts (требует токен)
export const getCourseWorkouts = async (courseId: string): Promise<WorkoutType[]> => {
    console.log('Getting course workouts:', courseId);
    try {
        const response = await authFetch(`/courses/${courseId}/workouts`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    } catch (error) {
        console.error('Ошибка загрузки тренировок курса:', error);
        return [];
    }
};

// GET /api/fitness/users/me/progress?courseId={courseId}&workoutId={workoutId} (требует токен)
export const getWorkoutProgress = async (courseId: string, workoutId: string): Promise<WorkoutProgressType | null> => {
    console.log('Getting workout progress:', { courseId, workoutId });

    try {
        const response = await authFetch(`/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`);
        
        // Клонируем response перед чтением
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        
        return data;
    } catch (error) {
        console.error('Ошибка загрузки прогресса тренировки:', error);
        return null;
    }
};

// PATCH /api/fitness/courses/[courseId]/reset (требует токен)
export const resetCourseProgress = async (courseId: string): Promise<{ message: string }> => {
    console.log('Resetting course progress:', courseId);
    try {
        const response = await authFetch(`/courses/${courseId}/reset`, {
            method: 'PATCH',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка сброса прогресса курса:', error);
        throw error;
    }
};

// PATCH /api/fitness/courses/[courseId]/workouts/[workoutId] (требует токен)
export const saveWorkoutProgress = async (courseId: string, workoutId: string, progressData: number[]): Promise<{ message: string }> => {
    console.log('Saving workout progress:', { courseId, workoutId, progressData });
    try {
        const response = await authFetch(`/courses/${courseId}/workouts/${workoutId}`, {
            method: 'PATCH',
            body: JSON.stringify({ progressData }),
        });

        const clonedResponse = response.clone();
        const data = await clonedResponse.json();

        return data;
    } catch (error) {
        console.error('Ошибка сохранения прогресса:', error);
        throw error;
    }
};

// PATCH /api/fitness/courses/[courseId]/workouts/[workoutId]/reset (требует токен)
export const resetWorkoutProgress = async (courseId: string, workoutId: string): Promise<{ message: string }> => {
    console.log('Resetting workout progress:', { courseId, workoutId });
    try {
        const response = await authFetch(`/courses/${courseId}/workouts/${workoutId}/reset`, {
            method: 'PATCH',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка сброса прогресса тренировки:', error);
        throw error;
    }
};

// GET /api/fitness/users/me (требует токен) - для получения курсов пользователя
export const getUserCourses = async (): Promise<string[]> => {
    const cachedCourses = storage.getUserCoursesIds();
    if (cachedCourses.length > 0) {
        return cachedCourses;
    }

    try {
        const response = await authFetch('/users/me');

        // Клонируем response перед чтением
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        
        // Извлекаем курсы из поля user или напрямую
        const userData = data.user || data;
        const courses = userData.selectedCourses || [];
        storage.setUserCoursesIds(courses);
        return courses;
    } catch (error) {
        console.error('Error in getUserCourses:', error);
        return [];
    }
};