import { courseOrder, sortCoursesByOrder } from "./courseSort";

describe('courseSort', () => {
    describe('courseOrder', () => {
        it('should have correct order for yoga courses', () => {
        expect(courseOrder['Yoga']).toBe(1);
        expect(courseOrder['Йога']).toBe(1);
        });

        it('should have correct order for stretching courses', () => {
        expect(courseOrder['Stretching']).toBe(2);
        expect(courseOrder['Стретчинг']).toBe(2);
        });

        it('should return 999 for unknown courses', () => {
        expect(courseOrder['Unknown']).toBeUndefined();
        });
    });

    describe('sortCoursesByOrder', () => {
        const mockCourses = [
        { nameEN: 'Fitness', nameRU: 'Фитнес' },
        { nameEN: 'Yoga', nameRU: 'Йога' },
        { nameEN: 'Bodyflex', nameRU: 'Бодифлекс' },
        { nameEN: 'Unknown', nameRU: 'Неизвестный' },
        ];

        it('should sort courses by predefined order', () => {
        const sorted = sortCoursesByOrder(mockCourses);
        
        expect(sorted[0].nameEN).toBe('Yoga');
        expect(sorted[1].nameEN).toBe('Fitness');
        expect(sorted[2].nameEN).toBe('Bodyflex');
        expect(sorted[3].nameEN).toBe('Unknown');
        });

        it('should not mutate original array', () => {
        const original = [...mockCourses];
        sortCoursesByOrder(mockCourses);
        
        expect(mockCourses).toEqual(original);
        });

        it('should handle empty array', () => {
        const sorted = sortCoursesByOrder([]);
        expect(sorted).toEqual([]);
        });

        it('should put unknown courses at the end', () => {
        const courses = [
            { nameEN: 'Unknown1', nameRU: 'Неизвестный1' },
            { nameEN: 'Yoga', nameRU: 'Йога' },
            { nameEN: 'Unknown2', nameRU: 'Неизвестный2' },
        ];
        
        const sorted = sortCoursesByOrder(courses);
        
        expect(sorted[0].nameEN).toBe('Yoga');
        expect(sorted[1].nameEN).toBe('Unknown1');
        expect(sorted[2].nameEN).toBe('Unknown2');
        });
    });
});