export const courseOrder: Record<string, number> = {
  'Yoga': 1,
  'Stretching': 2,
  'Fitness': 3,
  'StepAerobics': 4,
  'Bodyflex': 5,
  'Йога': 1,
  'Стретчинг': 2,
  'Фитнес': 3,
  'Степ-аэробика': 4,
  'Бодифлекс': 5,
};

export const sortCoursesByOrder = <T extends { nameEN: string }>(courses: T[]): T[] => {
  return [...courses].sort((a, b) => {
    const orderA = courseOrder[a.nameEN] || 999;
    const orderB = courseOrder[b.nameEN] || 999;
    return orderA - orderB;
  });
};