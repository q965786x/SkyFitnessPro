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
            const clonedResponse = response.clone();           
            let errorMessage = `HTTP ${response.status}`;
            try {
                const error = await clonedResponse.json();                
                errorMessage = error.message || error.error || errorMessage;
            } catch {}
            throw new Error(errorMessage);
        }
        return response;
    }).finally(() => {        
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

export const getAllCourses = async (): Promise<CourseType[]> => {
    
    try {
        const response = await publicFetch('/courses');
        const data = await response.json();
        
        if (Array.isArray(data)) {
            return data;        
        }
        
        return [];
    } catch {        
        return [];
    }
};

export const getCourseById = async (courseId: string): Promise<CourseType | null> => {
    
    try {
        const response = await publicFetch(`/courses/${courseId}`);
        const data = await response.json();
        
        if (data && data._id) {
            return data;
        }
        
        
        return null;
    } catch {        
        return null;
    }
};

// ============ ЗАЩИЩЕННЫЕ ЭНДПОИНТЫ (требуют токен) ============


export const getWorkoutById = async (workoutId: string): Promise<WorkoutType | null> => {
    
    try {
        const response = await authFetch(`/workouts/${workoutId}`);        
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();

        if (!text) {            
            return null;
        }
        
        const data = JSON.parse(text);
        
        if (data && data._id) {
            return data;
        }        
        
        return null;
    } catch {        
        return null;
    }
};

export const getCourseProgressById = async (courseId: string): Promise<CourseProgressType | null> => {
    
    try {
        const response = await authFetch(`/users/me/progress?courseId=${courseId}`);
        const data = await response.json();
        return data;
    } catch {        
        return null;
    }
};

export const addCourseToUser = async (courseId: string): Promise<{ message: string }> => {
    
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
        
        const currentCourses = storage.getUserCoursesIds();
        if (!currentCourses.includes(courseId)) {
            storage.setUserCoursesIds([...currentCourses, courseId]);
        }
        
        return data;
    } catch (error) {        
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage === 'Курс уже был добавлен!') {            
            return { message: 'Курс уже добавлен' };
        }        
        
        throw error;
    }
};

export const deleteCourseFromUser = async (courseId: string): Promise<{ message: string }> => {
    
    try {
        const response = await authFetch(`/users/me/courses/${courseId}`, {
            method: 'DELETE',
        });
        
        const data = await response.json();
        
        const currentCourses = storage.getUserCoursesIds();
        storage.setUserCoursesIds(currentCourses.filter(id => id !== courseId));
        
        return data;
    } catch (error) {        
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage === 'У пользователя не был добавлен этот курс!') {
            const currentCourses = storage.getUserCoursesIds();
            storage.setUserCoursesIds(currentCourses.filter(id => id !== courseId));
            return { message: 'Курс удалён из локального списка' };
        }        
        throw error;
    }
};

export const getCourseWorkouts = async (courseId: string): Promise<WorkoutType[]> => {
    
    try {
        const response = await authFetch(`/courses/${courseId}/workouts`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    } catch {        
        return [];
    }
};

export const getWorkoutProgress = async (courseId: string, workoutId: string): Promise<WorkoutProgressType | null> => {
    
    try {
        const response = await authFetch(`/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`);
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        
        return data;
    } catch {        
        return null;
    }
};

export const resetCourseProgress = async (courseId: string): Promise<{ message: string }> => {
    
    try {
        const response = await authFetch(`/courses/${courseId}/reset`, {
            method: 'PATCH',
        });
        const data = await response.json();
        return data;
    } catch (error) {        
        throw error;
    }
};

export const saveWorkoutProgress = async (courseId: string, workoutId: string, progressData: number[]): Promise<{ message: string }> => {
    
    try {
        const response = await authFetch(`/courses/${courseId}/workouts/${workoutId}`, {
            method: 'PATCH',
            body: JSON.stringify({ progressData }),
        });

        const clonedResponse = response.clone();
        const data = await clonedResponse.json();

        return data;
    } catch (error) {        
        throw error;
    }
};

export const resetWorkoutProgress = async (courseId: string, workoutId: string): Promise<{ message: string }> => {
    
    try {
        const response = await authFetch(`/courses/${courseId}/workouts/${workoutId}/reset`, {
            method: 'PATCH',
        });
        const data = await response.json();
        return data;
    } catch (error) {        
        throw error;
    }
};

export const getUserCourses = async (): Promise<string[]> => {
    const cachedCourses = storage.getUserCoursesIds();
    if (cachedCourses.length > 0) {
        return cachedCourses;
    }

    try {
        const response = await authFetch('/users/me');
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();        
        
        const userData = data.user || data;
        const courses = userData.selectedCourses || [];
        storage.setUserCoursesIds(courses);
        return courses;
    } catch {        
        return [];
    }
};