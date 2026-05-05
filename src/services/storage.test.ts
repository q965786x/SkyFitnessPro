import { storage } from "./storage";

describe('storage', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('token methods', () => {
        it('should set and get token', () => {
        const token = 'test-token-123';
        storage.setToken(token);
        expect(storage.getToken()).toBe(token);
        });

        it('should remove token', () => {
        storage.setToken('test-token');
        storage.removeToken();
        expect(storage.getToken()).toBeNull();
        });

        it('should return null if token not exists', () => {
        expect(storage.getToken()).toBeNull();
        });
    });

    describe('user methods', () => {
        const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        };

        it('should set and get user', () => {
        storage.setUser(mockUser);
        expect(storage.getUser()).toEqual(mockUser);
        });

        it('should remove user', () => {
        storage.setUser(mockUser);
        storage.removeUser();
        expect(storage.getUser()).toBeNull();
        });

        it('should return null if user not exists', () => {
        expect(storage.getUser()).toBeNull();
        });
    });

    describe('user courses ids', () => {
        const coursesIds = ['course1', 'course2', 'course3'];

        it('should set and get user courses ids', () => {
        storage.setUserCoursesIds(coursesIds);
        expect(storage.getUserCoursesIds()).toEqual(coursesIds);
        });

        it('should return empty array if no courses', () => {
        expect(storage.getUserCoursesIds()).toEqual([]);
        });

        it('should remove user courses ids', () => {
        storage.setUserCoursesIds(coursesIds);
        storage.removeUserCoursesIds();
        expect(storage.getUserCoursesIds()).toEqual([]);
        });
    });

    describe('clearAll', () => {
        it('should clear all stored data', () => {
        storage.setToken('token');
        storage.setUser({ name: 'Test', email: 'test@test.com' });
        storage.setUserCoursesIds(['course1']);
        
        storage.clearAll();
        
        expect(storage.getToken()).toBeNull();
        expect(storage.getUser()).toBeNull();
        expect(storage.getUserCoursesIds()).toEqual([]);
        });
    });
});