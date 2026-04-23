export type User = {
    name: string;
    email: string;    
};

export const storage = {
    // Токен
    getToken: (): string | null => {
        return localStorage.getItem('token');
    },
    
    setToken: (token: string): void => {
        localStorage.setItem('token', token);
    },
    
    removeToken: (): void => {
        localStorage.removeItem('token');
    },

    // Пользователь
    getUser: (): User | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    setUser: (user: User): void => {
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    removeUser: (): void => {
        localStorage.removeItem('user');
    },

    // ID курсов пользователя (кэш)    
    getUserCoursesIds: (): string[] => {
        const courses = localStorage.getItem('userCoursesIds');
        return courses ? JSON.parse(courses) : [];
    },
    
    setUserCoursesIds: (courseIds: string[]): void => {
        localStorage.setItem('userCoursesIds', JSON.stringify(courseIds));
    },
    
    // Полная очистка
    clearAll: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userCoursesIds');
    }
};