'use client';

import Header from "@/components/Header/Header";
import styles from './page.module.css';
import Image from 'next/image';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, getAllCourses, getUserCourses, getCourseProgress, deleteCourseFromUser } from '@/services/api';
import { storage } from '@/services/storage';

type CourseWithProgress = {
  _id: string;
  nameRU: string;
  nameEN: string;
  durationInDays: number;
  dailyDurationInMinutes: { from: number; to: number };
  difficulty: string;
  progress: number; // вычисляем из тренировок
  image: string;
};

type Workout = {
    id: string;
    title: string;
    subtitle: string;
    day: string;
    completed?: boolean;
};

// Маппинг изображений
const getImagePath = (nameEN: string): string => {
  const imageMap: Record<string, string> = {
    'Yoga': '/img/Yoga.png',
    'Stretching': '/img/Stretching.png',
    'Fitness': '/img/Fitness.png',
    'StepAerobics': '/img/Step.png',
    'Bodyflex': '/img/Bodyflex.png',
  };
  return imageMap[nameEN] || '/img/Yoga.png';
};

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [courses, setCourses] = useState<CourseWithProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);   
    const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
       
    // Данные тренировок для каждого курса (синхронизированы с fitness.ts)
    const workoutsData: Record<string, Workout[]> = {
        '1': [ // Йога
            { id: '1', title: 'Урок 1. Основы йоги', subtitle: 'Йога', day: '1 день', completed: false },
            { id: '2', title: 'Урок 2. Утренняя практика', subtitle: 'Йога', day: '2 день', completed: false },
            { id: '3', title: 'Урок 3. Расслабление', subtitle: 'Йога', day: '3 день', completed: false },
            { id: '4', title: 'Урок 4. Баланс', subtitle: 'Йога', day: '4 день', completed: false },
            { id: '5', title: 'Урок 5. Медитация', subtitle: 'Йога', day: '5 день', completed: false },
        ],
        '2': [ // Стретчинг
            { id: '6', title: 'Урок 1. Растяжка ног', subtitle: 'Стретчинг', day: '1 день', completed: false },
            { id: '7', title: 'Урок 2. Растяжка спины', subtitle: 'Стретчинг', day: '2 день', completed: false },
            { id: '8', title: 'Урок 3. Растяжка рук', subtitle: 'Стретчинг', day: '3 день', completed: false },
        ],
        '3': [ // Фитнес
            { id: '9', title: 'Урок 1. Кардио', subtitle: 'Фитнес', day: '1 день', completed: false },
            { id: '10', title: 'Урок 2. Силовая', subtitle: 'Фитнес', day: '2 день', completed: false },
            { id: '11', title: 'Урок 3. HIIT', subtitle: 'Фитнес', day: '3 день', completed: false },
        ],
        '4': [ // Степ-аэробика
            { id: '12', title: 'Урок 1. Базовые шаги', subtitle: 'Степ-аэробика', day: '1 день', completed: false },
            { id: '13', title: 'Урок 2. Комбинации', subtitle: 'Степ-аэробика', day: '2 день', completed: false },
            { id: '14', title: 'Урок 3. Интенсив', subtitle: 'Степ-аэробика', day: '3 день', completed: false },
        ],
        '5': [ // Бодифлекс
            { id: '15', title: 'Урок 1. Дыхательная гимнастика', subtitle: 'Бодифлекс', day: '1 день', completed: false },
            { id: '16', title: 'Урок 2. Изометрические позы', subtitle: 'Бодифлекс', day: '2 день', completed: false },
            { id: '17', title: 'Урок 3. Растяжка в движении', subtitle: 'Бодифлекс', day: '3 день', completed: false },
        ],
    };

    
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = storage.getToken();
                if (!token) {
                    router.push('/workout/main');
                    return;
                }
                
                // Получаем данные пользователя - добавляем .data
                const userResponse = await getMe();
                const userData = userResponse.data;
                setUser({
                    name: userData.email.split('@')[0],
                    email: userData.email,
                });
                
                // Получаем все курсы - добавляем .data
                const coursesResponse = await getAllCourses();
                const allCourses = coursesResponse.data;
                
                // Получаем ID курсов пользователя
                const userCourseIds = await getUserCourses();
                
                // Для каждого курса загружаем прогресс
                const coursesWithProgress: CourseWithProgress[] = [];
                
                for (const courseId of userCourseIds) {
                    const course = allCourses.find((c: { _id: string }) => c._id === courseId);
                    if (course) {
                        try {
                            const progressResponse = await getCourseProgress(courseId);
                            const progress = progressResponse.data;
                            
                            // Вычисляем общий прогресс курса
                            let totalProgress = 0;
                            if (progress.workoutsProgress && progress.workoutsProgress.length > 0) {
                                const completedCount = progress.workoutsProgress.filter(
                                    (w: { workoutCompleted: boolean }) => w.workoutCompleted
                                ).length;
                                totalProgress = Math.round((completedCount / progress.workoutsProgress.length) * 100);
                            }
                            
                            coursesWithProgress.push({
                                _id: course._id,
                                nameRU: course.nameRU,
                                nameEN: course.nameEN,
                                durationInDays: course.durationInDays,
                                dailyDurationInMinutes: course.dailyDurationInMinutes,
                                difficulty: course.difficulty,
                                progress: totalProgress,
                                image: getImagePath(course.nameEN),
                            });
                        } catch (err) {                            
                            // Если нет прогресса — добавляем с 0%
                            console.error('Ошибка загрузки прогресса для курса:', course.nameRU, err);
                            coursesWithProgress.push({
                                _id: course._id,
                                nameRU: course.nameRU,
                                nameEN: course.nameEN,
                                durationInDays: course.durationInDays,
                                dailyDurationInMinutes: course.dailyDurationInMinutes,
                                difficulty: course.difficulty,
                                progress: 0,
                                image: getImagePath(course.nameEN),
                            });
                        }
                    }
                }
                
                setCourses(coursesWithProgress);
            } catch (error) {
                console.error('Ошибка загрузки профиля:', error);
                router.push('/workout/main');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadProfile();
    }, [router]);

    const handleLogout = () => {
        storage.clearAll();
        router.push('/workout/main');
    };

    const handleDeleteCourse = async (courseId: string) => {
        try {
            await deleteCourseFromUser(courseId);
            setCourses(courses.filter(c => c._id !== courseId));
            
            // Обновляем кэш
            const updatedIds = courses.filter(c => c._id !== courseId).map(c => c._id);
            storage.setUserCoursesIds(updatedIds);
        } catch (error) {
            console.error('Ошибка удаления курса:', error);
            alert('Не удалось удалить курс');
        }
    };

    const handleCourseAction = (course: CourseWithProgress) => {
        setSelectedCourse(course);
        setIsWorkoutModalOpen(true);
    };

    const handleSelectWorkout = (workoutId: string) => {
        if (selectedCourse) {
            setIsWorkoutModalOpen(false);
            router.push(`/workout/course/${selectedCourse._id}/lesson/${workoutId}`);
        }
    };

    const handleCloseModal = () => {
        setIsWorkoutModalOpen(false);
        setSelectedCourse(null);
    };

    const getButtonText = (progress: number) => {
        if (progress === 0) {
            return "Начать тренировку";
        } else if (progress === 100) {
            return "Начать заново";
        } else {
            return "Продолжить";
        }
    };

    // Функция для определения статуса завершения тренировки
    const isWorkoutCompleted = (courseId: string): boolean => {
        const course = courses.find(c => c._id === courseId);
        if (!course) return false;

        // Для демо-режима: если прогресс курса 100%, все тренировки завершены
        if (course.progress === 100) return true;
        
        // Здесь можно добавить более точную логику из API прогресса
        return false;
    };

    if (isLoading) {
        return (
            <div className={styles['main-container']}>
                <div className={styles['page-content']}>
                    <Header />
                    <div className={styles['loading']}>Загрузка...</div>
                </div>
            </div>
        );
    }

    return (
       <div className={styles['main-container']}>
            <div className={styles['page-content']}>
                <Header />

                {/* Блок Профиль */}
                <div className={styles['profile-section']}>
                    <h1 className={styles['section-title']}>Профиль</h1>
                    <div className={styles['profile-card']}>
                        <div className={styles['profile-avatar']}>
                            <Image
                                width={197}
                                height={197}
                                src="/img/Profile.png"
                                alt="avatar"
                                className={styles['avatar-image']}
                            />
                        </div>
                        <div className={styles['profile-info']}>
                            <div className={styles['profile-name']}>{user?.name}</div>
                            <div className={styles['profile-login']}>Email: {user?.email}</div>
                            <button 
                                className={styles['logout-button']}
                                onClick={handleLogout}
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>

                {/* Блок Мои курсы */}
                <div className={styles['courses-section']}>
                    <h2 className={styles['section-title']}>Мои курсы</h2>
                    <div className={styles['courses-grid']}>
                        {courses.map((course) => (
                            <div key={course._id} className={styles['course-card']}>
                                <div className={styles['card-image-wrapper']}>
                                    <Image
                                        width={360}
                                        height={325}
                                        className={styles['card-image']}
                                        src={course.image}
                                        alt={course.nameRU}
                                    />
                                    {/* Иконка удаления на изображении */}
                                    <div 
                                        className={styles['delete-icon-wrapper']}
                                        onClick={() => handleDeleteCourse(course._id)}
                                    >
                                        <Image 
                                            width={32}
                                            height={32}
                                            className={styles['delete-icon-image']}
                                            src="/img/Delete-icon.png"
                                            alt="delete"
                                        />
                                    </div>
                                </div>
                                <div className={styles['card-content']}>
                                    <div className={styles['card-title']}>{course.nameRU}</div>
                                    
                                    <div className={styles['card-buttons-wrapper']}>
                                        <div className={styles['card-buttons-row']}>
                                            <button className={styles['btn-calendar']}>
                                                <Image
                                                    width={18}
                                                    height={18}
                                                    className={styles['btn-icon']}
                                                    src="/img/calendar-icon.png"
                                                    alt="calendar"
                                                />
                                                <span>{course.durationInDays}</span>
                                            </button>
                                            <button className={styles['btn-time']}>
                                                <Image
                                                    width={18}
                                                    height={18}
                                                    className={styles['btn-icon']}
                                                    src="/img/time-icon.png"
                                                    alt="time"
                                                />
                                                <span>{course.dailyDurationInMinutes.from}-{course.dailyDurationInMinutes.to} мин/день</span>
                                            </button>
                                        </div>
                                        <button className={styles['btn-difficulty']}>
                                            <Image
                                                width={18}
                                                height={18}
                                                className={styles['btn-icon']}
                                                src="/img/diagram-icon.png"
                                                alt="difficulty"
                                            />
                                            <span>Сложность: {course.difficulty}</span>
                                        </button>
                                    </div>

                                    {/* Блок прогресса */}
                                    <div className={styles['progress-section']}>
                                        <div className={styles['progress-header']}>
                                            <div className={styles['progress-label']}>Прогресс</div>
                                            <div className={styles['progress-percent']}>{course.progress}%</div>
                                        </div>
                                        <div className={styles['progress-bar-wrapper']}>
                                            <div 
                                                className={styles['progress-bar-fill']}
                                                style={{ width: `${course.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Кнопка действия */}
                                    <button 
                                        className={styles['continue-button']}
                                        onClick={() => handleCourseAction(course)}
                                    >
                                        {getButtonText(course.progress)}
                                    </button>                                    
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>    

            {/* Модальное окно выбора тренировки */}
            {isWorkoutModalOpen && selectedCourse && (
                <div className={styles['modal-overlay']} onClick={handleCloseModal}>
                    <div className={styles['workout-modal']} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles['workout-modal-title']}>Выберите тренировку</h2>
                        
                        <div className={styles['workout-list']}>
                            {workoutsData[selectedCourse._id]?.map((workout) => {
                                const isCompleted = isWorkoutCompleted(selectedCourse._id);
                                return (
                                    <div 
                                        key={workout.id}
                                        className={styles['workout-item']}
                                        onClick={() => handleSelectWorkout(workout.id)}
                                    >
                                        <div className={`${styles['workout-checkbox']} ${isCompleted ? styles['completed'] : ''}`}>
                                            {isCompleted && (
                                                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className={styles['workout-info']}>
                                            <div className={styles['workout-title']}>{workout.title}</div>
                                            <div className={styles['workout-subtitle']}>
                                                {workout.subtitle} / {workout.day}
                                            </div>
                                        </div>
                                        <div className={styles['workout-arrow']}>›</div>
                                    </div>
                                );
                            })}
                        </div>

                        <button 
                            className={styles['workout-start-button']}
                            onClick={handleCloseModal}
                        >
                            Начать
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}