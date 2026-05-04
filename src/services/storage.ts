import { UserType } from "@/sharedTypes/sharedTypes";

export type User = UserType;

export const storage = {
    
    getToken: (): string | null => {
        return localStorage.getItem('token');
    },
    
    setToken: (token: string): void => {
        localStorage.setItem('token', token);
    },
    
    removeToken: (): void => {
        localStorage.removeItem('token');
    },

    
    getUser: (): UserType | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    setUser: (user: UserType): void => {
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    removeUser: (): void => {
        localStorage.removeItem('user');
    },

    
    getUserCoursesIds: (): string[] => {
        const courses = localStorage.getItem('userCoursesIds');
        return courses ? JSON.parse(courses) : [];
    },
    
    setUserCoursesIds: (courseIds: string[]): void => {
        localStorage.setItem('userCoursesIds', JSON.stringify(courseIds));
    },

    removeUserCoursesIds: (): void => {
        localStorage.removeItem('userCoursesIds');
    },
    
    
    clearAll: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userCoursesIds');
    }
};