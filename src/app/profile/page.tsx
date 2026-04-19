'use client';

import Header from "@/src/components/Header/Header";
import { useEffect, useState } from "react";
import styles from './page.module.css';
import Image from 'next/image';
import { useRouter } from "next/navigation";


type Course = {
    id: string;
    title: string;
    image: string;
    duration: string;
    timing: string;
    difficulty: number; // процент сложности
    progress: number; // прогресс в процентах
};

type UserData = {
    name: string;
    login: string;
    avatar?: string;
};

type Workout = {
    id: string;
    title: string;
    subtitle: string;
    day: string;
    completed?: boolean;
};

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, string[]>>({});

    // Данные тренировок для каждого курса
    const workoutsData: Record<string, Workout[]> = {
        '1': [ // Йога
            { id: '1', title: 'Утренняя практика', subtitle: 'Йога на каждый день', day: '1 день', completed: false },
            { id: '2', title: 'Красота и здоровье', subtitle: 'Йога на каждый день', day: '2 день', completed: false },
            { id: '3', title: 'Асаны стоя', subtitle: 'Йога на каждый день', day: '3 день', completed: false },
            { id: '4', title: 'Растягиваем мышцы бедра', subtitle: 'Йога на каждый день', day: '4 день', completed: false },
            { id: '5', title: 'Гибкость спины', subtitle: 'Йога на каждый день', day: '5 день', completed: false },
        ],
        '2': [ // Стретчинг
            { id: '1', title: 'Утренний стретчинг', subtitle: 'Стретчинг на каждый день', day: '1 день', completed: false },
            { id: '2', title: 'Стретчинг для спины', subtitle: 'Стретчинг на каждый день', day: '2 день', completed: false },
            { id: '3', title: 'Растяжка ног', subtitle: 'Стретчинг на каждый день', day: '3 день', completed: false },
        ],
        '3': [ // Фитнес
            { id: '1', title: 'Фитнес утро', subtitle: 'Фитнес на каждый день', day: '1 день', completed: false },
            { id: '2', title: 'Кардио тренировка', subtitle: 'Фитнес на каждый день', day: '2 день', completed: false },
            { id: '3', title: 'Силовая тренировка', subtitle: 'Фитнес на каждый день', day: '3 день', completed: false },
        ],
    };

    useEffect(() => {
        // Загрузка данных пользователя и его курсов
        const loadUserData = () => {
            // Получаем данные пользователя из localStorage (как в Header)
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUser({
                    name: userData.name,
                    login: userData.email,
                });
            } else {
                // Демо-данные для тестирования
                setUser({
                    name: 'Сергей',
                    login: 'sergey.petrov96',
                });
            }

            // Загружаем курсы пользователя
            // В реальном приложении это был бы API-запрос
            const userCourses: Course[] = [
                {
                    id: '1',
                    title: 'Йога',
                    image: '/img/Yoga.png',
                    duration: '25 дней',
                    timing: '20-50 мин/день',
                    difficulty: 40,
                    progress: 52,
                },
                {
                    id: '2',
                    title: 'Стретчинг',
                    image: '/img/Stretching.png',
                    duration: '25 дней',
                    timing: '20-50 мин/день',
                    difficulty: 0,
                    progress: 0,
                },
                {
                    id: '3',
                    title: 'Фитнес',
                    image: '/img/Fitness.png',
                    duration: '25 дней',
                    timing: '20-50 мин/день',
                    difficulty: 100,
                    progress: 100,
                },
            ];
            setCourses(userCourses);

            // Загрузка сохраненных прогрессов из localStorage
            const savedProgress = localStorage.getItem('completedWorkouts');
            if (savedProgress) {
                setCompletedWorkouts(JSON.parse(savedProgress));
            }

            setIsLoading(false);
        };
        loadUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/auth/signin');
    };

    const handleCourseAction = (course: Course) => {
        // Открываем модальное окно с выбором тренировки
        setSelectedCourse(course);
        setIsWorkoutModalOpen(true);
    };

    const handleSelectWorkout = (workoutId: string) => {
        if (selectedCourse) {
            setIsWorkoutModalOpen(false);
            // Переход на страницу выбранной тренировки
            router.push(`/workout/course/${selectedCourse.id}/lesson/${workoutId}`);
        }
    };

    const handleCloseModal = () => {
        setIsWorkoutModalOpen(false);
        setSelectedCourse(null);
    };

    const handleDeleteCourse = (courseId: string) => {
        // Удаление курса из списка
        setCourses(courses.filter(course => course.id !== courseId));
        // Здесь также нужно отправить запрос на сервер
    };

    // Функция для получения текста кнопки в зависимости от прогресса
    const getButtonText = (progress: number) => {
        if (progress === 0) {
            return "Начать тренировку";
        } else if (progress === 100) {
            return "Начать заново";
        } else {
            return "Продолжить";
        }
    };

    // Функция для проверки, пройдена ли тренировка
    const isWorkoutCompleted = (courseId: string, workoutId: string): boolean => {
        return completedWorkouts[courseId]?.includes(workoutId) || false;
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
                            <div className={styles['profile-login']}>Логин: {user?.login}</div>
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
                            <div key={course.id} className={styles['course-card']}>
                                <div className={styles['card-image-wrapper']}>
                                    <Image
                                        width={360}
                                        height={325}
                                        className={styles['card-image']}
                                        src={course.image}
                                        alt={course.title}
                                    />
                                    {/* Иконка удаления на изображении */}
                                    <div 
                                        className={styles['delete-icon-wrapper']}
                                        onClick={() => handleDeleteCourse(course.id)}
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
                                    <div className={styles['card-title']}>{course.title}</div>
                                    
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
                                                <span>{course.duration}</span>
                                            </button>
                                            <button className={styles['btn-time']}>
                                                <Image
                                                    width={18}
                                                    height={18}
                                                    className={styles['btn-icon']}
                                                    src="/img/time-icon.png"
                                                    alt="time"
                                                />
                                                <span>{course.timing}</span>
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
                                            <span>Сложность: {course.difficulty}%</span>
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

                                    {/* Кнопка действия - текст зависит от прогресса */}
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
                            {workoutsData[selectedCourse.id]?.map((workout) => {
                                const isCompleted = isWorkoutCompleted(selectedCourse.id, workout.id);
                                return (
                                    <div 
                                        key={workout.id}
                                        className={styles['workout-item']}
                                        onClick={() => handleSelectWorkout(workout.id)}
                                    >
                                        {/* Кружок 24x24 */}
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