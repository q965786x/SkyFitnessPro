'use client';

import Header from "@/components/Header/Header";
import styles from './page.module.css';
import Image from 'next/image';
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from '@/services/storage';
import { 
    deleteCourseFromUser, 
    getAllCourses, 
    getUserCourses, 
    getWorkoutProgress,
    getCourseWorkouts    
 } from "@/services/courses/coursesApi";
import { getMe, logoutUser } from "@/services/auth/authApi";
import { useToast } from "@/hooks/useToast";
import CourseImage from "@/components/CourseImage/CourseImage";
import { sortCoursesByOrder } from "@/utils/courseSort";

type CourseWithProgress = {
  _id: string;
  nameRU: string;
  nameEN: string;
  durationInDays: number;
  dailyDurationInMinutes: { from: number; to: number };
  difficulty: string;
  progress: number; 
  workouts: string[];
};

type Workout = {
    _id: string;
    name: string;
    day: number;
    completed?: boolean;
};

export default function ProfilePage() {
    const { showSuccess, showError, showLoading, dismiss } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [courses, setCourses] = useState<CourseWithProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);  
    const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [courseWorkouts, setCourseWorkouts] = useState<Record<string, Workout[]>>({});
    const [workoutsProgress, setWorkoutsProgress] = useState<Record<string, Record<string, boolean>>>({});
    
    // ДОБАВЛЯЕМ ФЛАГ ДЛЯ ОТСЛЕЖИВАНИЯ ОБНОВЛЕНИЙ
    const [refreshKey, setRefreshKey] = useState(0);

    // ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ ДАННЫХ (будем вызывать после возврата со страницы тренировки)
    const refreshProfileData = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);
    
    // Загрузка статуса тренировок
    const loadWorkoutsStatus = useCallback(async (courseId: string, workouts: Workout[]) => {
        try {
            const statusMap: Record<string, boolean> = {};

            // ПРОВЕРЯЕМ КЭШ ОБНОВЛЕНИЙ
            const updatedWorkouts = JSON.parse(localStorage.getItem('updatedWorkouts') || '{}');

            for (const workout of workouts) {
                const cacheKey = `${courseId}_${workout._id}`;
                const cachedUpdate = updatedWorkouts[cacheKey];

                // Если есть недавнее обновление (менее 5 минут), используем его
                if (cachedUpdate && (Date.now() - cachedUpdate.timestamp) < 300000) {
                    statusMap[workout._id] = cachedUpdate.workoutCompleted;
                } else {
                    // Иначе загружаем с сервера
                    const progress = await getWorkoutProgress(courseId, workout._id);
                    statusMap[workout._id] = progress?.workoutCompleted || false;
                }
            }
            setWorkoutsProgress(prev => ({
                ...prev,
                [courseId]: statusMap
            }));
        } catch (error) {
            console.error('Ошибка загрузки статуса тренировок:', error);
        }
    }, []);

    // Загрузка тренировок курса
    const loadCourseWorkouts = useCallback(async (courseId: string) => {
        try {
            const workouts = await getCourseWorkouts(courseId);
            const workoutsWithDay: Workout[] = workouts.map((workout, index) => ({
                _id: workout._id,
                name: workout.name,
                day: index + 1,
                completed: false
            }));
            setCourseWorkouts(prev => ({ ...prev, [courseId]: workoutsWithDay }));
            await loadWorkoutsStatus(courseId, workoutsWithDay);
        } catch (error) {
            console.error('Ошибка загрузки тренировок курса:', error);
            setCourseWorkouts(prev => ({ ...prev, [courseId]: [] }));
        }
    }, [loadWorkoutsStatus]);

    // Функция для вычисления прогресса курса на основе статуса тренировок
    const calculateCourseProgress = useCallback((courseId: string, workouts: Workout[]): number => {
        const statusMap = workoutsProgress[courseId] || {};
        if (workouts.length === 0) return 0;
        const completedCount = workouts.filter(workout => statusMap[workout._id]).length;
        return Math.round((completedCount / workouts.length) * 100);
    }, [workoutsProgress]);

    
    // ВЫНОСИМ ЛОГИКУ ЗАГРУЗКИ ПРОФИЛЯ В ОТДЕЛЬНУЮ ФУНКЦИЮ
    const loadProfile = useCallback(async () => {
        try {
            setError(null);
            const token = storage.getToken();
            if (!token) {
                router.push('/workout/main');
                return;
            }
            
            // Получаем данные пользователя
            const userResponse = await getMe();
            const userData = userResponse.data;
            setUser({
                name: userData.email.split('@')[0],
                email: userData.email,
            });
            
            // Получаем все курсы
            const allCourses = await getAllCourses();
            
            // Получаем ID курсов пользователя
            const userCourseIds = await getUserCourses();

            if (userCourseIds.length === 0) {
                setCourses([]);
                setIsLoading(false);
                return;
            }

            // Загружаем тренировки для всех курсов пользователя
            for (const courseId of userCourseIds) {
                await loadCourseWorkouts(courseId);
            }
            
            // Формируем массив курсов с прогрессом
            const coursesWithProgress: CourseWithProgress[] = [];
            
            for (const courseId of userCourseIds) {
                const course = allCourses.find((c) => c._id === courseId);
                if (course) {
                    const courseWorkoutsList = courseWorkouts[courseId] || [];
                    const totalProgress = calculateCourseProgress(courseId, courseWorkoutsList);

                    coursesWithProgress.push({
                        _id: course._id,
                        nameRU: course.nameRU,
                        nameEN: course.nameEN,
                        durationInDays: course.durationInDays,
                        dailyDurationInMinutes: course.dailyDurationInMinutes,
                        difficulty: course.difficulty,
                        progress: totalProgress,
                        workouts: course.workouts || [],
                    });
                }
            }                        
            
            // СОРТИРУЕМ КУРСЫ 
            const sortedCourses = sortCoursesByOrder(coursesWithProgress);
            setCourses(sortedCourses);
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            setError('Не удалось загрузить профиль. Пожалуйста, попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    }, [router, loadCourseWorkouts, calculateCourseProgress, courseWorkouts]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile, refreshKey]); 
    
    // Очищаем кэш обновлений при выходе из профиля
    useEffect(() => {
        return () => {
            // Не очищаем полностью, только старые записи (старше 1 часа)
            const updatedWorkouts = JSON.parse(localStorage.getItem('updatedWorkouts') || '{}');
            const now = Date.now();
            let hasChanges = false;
            
            Object.keys(updatedWorkouts).forEach(key => {
                if (now - updatedWorkouts[key].timestamp > 3600000) { // 1 час
                    delete updatedWorkouts[key];
                    hasChanges = true;
                }
            });
            
            if (hasChanges) {
                localStorage.setItem('updatedWorkouts', JSON.stringify(updatedWorkouts));
            }
        };
    }, []);

    const handleDeleteCourse = async (courseId: string) => {
        const loadingToast = showLoading('Удаление курса...');

        try {
            await deleteCourseFromUser(courseId);
            setCourses(courses.filter(c => c._id !== courseId));
            
            const updatedIds = courses.filter(c => c._id !== courseId).map(c => c._id);
            storage.setUserCoursesIds(updatedIds);

            // Очищаем кэш тренировок
            setCourseWorkouts(prev => {
                const newState = { ...prev };
                delete newState[courseId];
                return newState;
            });

            dismiss(loadingToast);
            showSuccess('Курс успешно удален!');
        } catch (error) {
            dismiss(loadingToast);
            console.error('Ошибка удаления курса:', error);
            showError('Не удалось удалить курс');
        }
    };

    const handleCourseAction = (course: CourseWithProgress) => {
        setSelectedCourse(course);
        setIsWorkoutModalOpen(true);
    };

    const handleSelectWorkout = (workoutId: string) => {
        if (selectedCourse) {
            setIsWorkoutModalOpen(false);
            localStorage.setItem('returnToProfile', 'true');
            router.push(`/workout/course/${selectedCourse._id}/lesson/${workoutId}`);
        }
    };

    const handleCloseModal = () => {
        setIsWorkoutModalOpen(false);
        setSelectedCourse(null);
    };

    const handleLogout = () => {
        logoutUser();
        router.push('/workout/main');
    };

    const getButtonText = (progress: number) => {
        if (progress === 0) return "Начать тренировку";
        if (progress === 100) return "Начать заново";
        return "Продолжить";
    };

    const isWorkoutCompleted = (courseId: string, workoutId: string): boolean => {
        return workoutsProgress[courseId]?.[workoutId] || false;
    };

    // ПРОВЕРЯЕМ, НУЖНО ЛИ ОБНОВИТЬ ДАННЫЕ ПРИ ВОЗВРАТЕ НА СТРАНИЦУ
    useEffect(() => {
        const shouldRefresh = localStorage.getItem('returnToProfile');
        if (shouldRefresh === 'true') {
            localStorage.removeItem('returnToProfile');
            refreshProfileData();
        }
    }, [refreshProfileData]);


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

    if (error) {
        return (
        <div className={styles['main-container']}>
            <div className={styles['page-content']}>
            <Header />
            <div className={styles['error']}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className={styles['retry-button']}>
                Попробовать снова
                </button>
            </div>
            </div>
        </div>
        );
    }

    return (
       <div className={styles['main-container']}>
            <div className={styles['page-content']}>
                <Header />

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

                <div className={styles['courses-section']}>
                    <h2 className={styles['section-title']}>Мои курсы</h2>
                    {courses.length === 0 ? (
                        <div className={styles['no-courses']}>
                        <p>У вас пока нет добавленных курсов</p>
                        <button 
                            className={styles['browse-courses-button']}
                            onClick={() => router.push('/workout/main')}
                        >
                            Посмотреть курсы
                        </button>
                        </div>
                    ) : (
                        <div className={styles['courses-grid']}>
                            {courses.map((course) => (
                                <div key={course._id} className={styles['course-card']}>
                                    <div className={styles['card-image-wrapper']}>
                                        <CourseImage
                                            nameEN={course.nameEN}
                                            nameRU={course.nameRU}
                                            type="card"
                                            width={360}
                                            height={325}
                                            className={styles['card-image']}
                                        />
                                        
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
                    )}
                </div>
            </div>    

            
            {isWorkoutModalOpen && selectedCourse && (
                <div className={styles['modal-overlay']} onClick={handleCloseModal}>
                    <div className={styles['workout-modal']} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles['workout-modal-title']}>Выберите тренировку</h2>
                        
                        <div className={styles['workout-list']}>
                            {(courseWorkouts[selectedCourse._id] || []).map((workout) => {
                                const isCompleted = isWorkoutCompleted(selectedCourse._id, workout._id);
                                return (
                                    <div 
                                        key={workout._id}
                                        className={styles['workout-item']}
                                        onClick={() => handleSelectWorkout(workout._id)}
                                    >
                                        <div className={`${styles['workout-checkbox']} ${isCompleted ? styles['completed'] : ''}`}>
                                            {isCompleted && (
                                                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className={styles['workout-info']}>
                                            <div className={styles['workout-title']}>{workout.name}</div>
                                            <div className={styles['workout-subtitle']}>
                                                Тренировка / {workout.day} день
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