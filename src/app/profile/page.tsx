'use client';

import Header from "@/components/Header/Header";
import styles from './page.module.css';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { 
    fetchAllCourses, 
    fetchUserCourses, 
    deleteCourse,
    fetchCourseWorkouts 
} from "@/store/slices/coursesSlice";
import { updateLocalProgress } from '@/store/slices/progressSlice';

import CourseImage from "@/components/CourseImage/CourseImage";
import { sortCoursesByOrder } from "@/utils/courseSort";
import { useToast } from "@/utils/useToast";
import { resetCourseProgress } from '@/services/api/coursesApi';

type SavedWorkoutProgress = {
    progressData: number[];
    workoutCompleted: boolean;
    timestamp: number;
}

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
    const dispatch = useAppDispatch();
    
    const { user, isAuthorized } = useAppSelector((state) => state.auth);
    const { allCourses, userCoursesIds, isLoading: coursesLoading, courseWorkouts } = useAppSelector((state) => state.courses);
    const workoutProgress = useAppSelector((state) => state.progress.workoutProgress);
    
    const [courses, setCourses] = useState<CourseWithProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);  
    const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
    const [workoutsCompleted, setWorkoutsCompleted] = useState<Record<string, Record<string, boolean>>>({});

    const hasLoadedRef = useRef(false);
    const isUpdatingRef = useRef(false);
    
    const calculateCourseProgress = useCallback((courseId: string): number => {
        const workouts = courseWorkouts[courseId] || [];
        if (workouts.length === 0) return 0;
        
        let completedCount = 0;
        for (const workout of workouts) {
            const key = `${courseId}_${workout._id}`;
            const progress = workoutProgress[key];
            if (progress?.workoutCompleted) {
                completedCount++;
            }
        }        
        return Math.round((completedCount / workouts.length) * 100);
    }, [courseWorkouts, workoutProgress]);
    
    const loadProfile = useCallback(async () => {
        if (isUpdatingRef.current) return;
        isUpdatingRef.current = true;

        try {
            setError(null);
            
            await dispatch(fetchAllCourses()).unwrap();
            await dispatch(fetchUserCourses()).unwrap();
            
            if (userCoursesIds.length === 0) {
                setCourses([]);
                setIsLoading(false);
                return;
            }            
            
            for (const courseId of userCoursesIds) {
                if (!courseWorkouts[courseId] || courseWorkouts[courseId].length === 0) {
                    await dispatch(fetchCourseWorkouts(courseId)).unwrap();
                }
            }            
            
            const coursesWithProgress: CourseWithProgress[] = [];
            
            for (const courseId of userCoursesIds) {
                const course = allCourses.find((c) => c._id === courseId);
                if (course) {
                    const totalProgress = calculateCourseProgress(courseId);
                    
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
            
            const sortedCourses = sortCoursesByOrder(coursesWithProgress);
            setCourses(sortedCourses);
        } catch {            
            setError('Не удалось загрузить профиль. Пожалуйста, попробуйте позже.');
        } finally {
            setIsLoading(false);
            isUpdatingRef.current = false;
        }
    }, [dispatch, userCoursesIds, allCourses, courseWorkouts, calculateCourseProgress]);

    const updateWorkoutsStatus = useCallback(() => {
        const newWorkoutsCompleted: Record<string, Record<string, boolean>> = {};
        
        for (const courseId of userCoursesIds) {
            const workouts = courseWorkouts[courseId] || [];
            const statusMap: Record<string, boolean> = {};
            
            for (const workout of workouts) {
                const key = `${courseId}_${workout._id}`;
                const progress = workoutProgress[key];
                statusMap[workout._id] = progress?.workoutCompleted || false;
            }
            
            newWorkoutsCompleted[courseId] = statusMap;
        }
        
        setWorkoutsCompleted(newWorkoutsCompleted);
    }, [userCoursesIds, courseWorkouts, workoutProgress]);
    
    const refreshCoursesProgress = useCallback(() => {
        if (courses.length === 0) return;
        
        setCourses(prevCourses => 
            prevCourses.map(course => {
                const newProgress = calculateCourseProgress(course._id);
                if (course.progress === newProgress) return course;
                return { ...course, progress: newProgress };
            })
        );
    }, [courses, calculateCourseProgress]);

    
    useEffect(() => {
        const savedProgress = localStorage.getItem('updatedWorkouts');
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress) as Record<string, SavedWorkoutProgress>;
                                
                Object.entries(parsed).forEach(([key, value]) => {
                    const [courseId, workoutId] = key.split('_');
                    if (courseId && workoutId && value.progressData) {
                        dispatch(updateLocalProgress({
                            courseId,
                            workoutId,
                            progressData: value.progressData,
                            workoutCompleted: value.workoutCompleted
                        }));
                    }
                });
            } catch {
                
            }
        }
    }, [dispatch]);

    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refresh = urlParams.get('refresh');
        if (refresh) {
            window.history.replaceState({}, document.title, '/profile');
            loadProfile();
        }
    }, [loadProfile]);
    
    
    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;
        
        if (!isAuthorized) {
            router.push('/workout/main');
            return;
        }
        
        loadProfile();
    }, [isAuthorized, router, loadProfile]);
    
    
    useEffect(() => {
        updateWorkoutsStatus();
    }, [userCoursesIds, courseWorkouts, workoutProgress, updateWorkoutsStatus]);

    
    useEffect(() => {
        const updateProgress = async () => {
            if (courses.length === 0) return;           
            
            const updatedCourses = await Promise.all(
                courses.map(async (course) => {
                    const workouts = courseWorkouts[course._id] || [];
                    let completedCount = 0;
                    
                    for (const workout of workouts) {
                        const key = `${course._id}_${workout._id}`;
                        const progress = workoutProgress[key];
                       
                        const savedProgress = localStorage.getItem('updatedWorkouts');
                        let isCompleted = progress?.workoutCompleted || false;
                        
                        if (!isCompleted && savedProgress) {
                            const parsed = JSON.parse(savedProgress);
                            if (parsed[key]?.workoutCompleted) {
                                isCompleted = true;
                            }
                        }
                        
                        if (isCompleted) {
                            completedCount++;
                        }
                    }
                    
                    const newProgress = workouts.length > 0 
                        ? Math.round((completedCount / workouts.length) * 100) 
                        : 0;
                    
                    return { ...course, progress: newProgress };
                })
            );            
            
            const hasChanges = updatedCourses.some((course, index) => course.progress !== courses[index].progress);
            if (hasChanges) {                
                setCourses(updatedCourses);
            }
        };
        
        updateProgress();
    }, [workoutProgress, courseWorkouts, courses]);
    
    useEffect(() => {
        const handleRefresh = () => {
            const shouldRefresh = localStorage.getItem('returnToProfile');
            if (shouldRefresh === 'true') {
                localStorage.removeItem('returnToProfile');
                loadProfile();
            }
        };

        document.addEventListener('visibilitychange', handleRefresh);
        window.addEventListener('focus', handleRefresh);
        
        return () => {
            document.removeEventListener('visibilitychange', handleRefresh);
            window.removeEventListener('focus', handleRefresh);
        };
    }, [loadProfile]);
    
    const handleResetCourse = async (courseId: string) => {
        const loadingToast = showLoading('Сброс прогресса...');
        
        try {            
            await resetCourseProgress(courseId);            
            
            const workouts = courseWorkouts[courseId] || [];
            for (const workout of workouts) {                
                dispatch(updateLocalProgress({
                    courseId,
                    workoutId: workout._id,
                    progressData: [],
                    workoutCompleted: false
                }));
            }            
            
            const savedProgress = localStorage.getItem('updatedWorkouts');
            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);
                for (const workout of workouts) {
                    const key = `${courseId}_${workout._id}`;
                    delete parsed[key];
                }
                localStorage.setItem('updatedWorkouts', JSON.stringify(parsed));
            }            
            
            updateWorkoutsStatus();            
            refreshCoursesProgress();           
            dismiss(loadingToast);
            showSuccess('Прогресс курса сброшен!');            
            
            await loadProfile();
            
        } catch {
            dismiss(loadingToast);            
            showError('Не удалось сбросить прогресс');
        }
    };


    const handleDeleteCourse = async (courseId: string) => {
        const loadingToast = showLoading('Удаление курса...');
        
        setCourses(prevCourses => prevCourses.filter(c => c._id !== courseId));
        
        setWorkoutsCompleted(prev => {
            const newState = { ...prev };
            delete newState[courseId];
            return newState;
        });

        try {
            await dispatch(deleteCourse(courseId)).unwrap();
            dismiss(loadingToast);
            showSuccess('Курс успешно удален!');            
            
            await dispatch(fetchUserCourses()).unwrap();
            
        } catch {
            dismiss(loadingToast);            
            showError('Курс удален из списка');            
            
            await dispatch(fetchUserCourses()).unwrap();
        }
    };

    const handleCourseAction = async (course: CourseWithProgress) => {
        if (course.progress === 100) {
            await handleResetCourse(course._id);
            return;
        }
        
        setSelectedCourse(course);
        setIsWorkoutModalOpen(true);
        setIsLoadingWorkouts(true);

        if (!courseWorkouts[course._id] || courseWorkouts[course._id].length === 0) {
            await dispatch(fetchCourseWorkouts(course._id)).unwrap();
        }
        
        setIsLoadingWorkouts(false);
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
        setIsLoadingWorkouts(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        router.push('/workout/main');
    };

    const getButtonText = (progress: number) => {
        if (progress === 0) return "Начать тренировку";
        if (progress === 100) return "Начать заново";
        return "Продолжить";
    };

    const isWorkoutCompleted = (courseId: string, workoutId: string): boolean => {
        return workoutsCompleted[courseId]?.[workoutId] || false;
    };

    const getCurrentCourseWorkouts = (): Workout[] => {
        if (!selectedCourse) return [];
        const workouts = courseWorkouts[selectedCourse._id] || [];
        return workouts.map((workout, index) => ({
            _id: workout._id,
            name: workout.name,
            day: index + 1,
            completed: false
        }));
    };

    if (isLoading || coursesLoading) {
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
                <button onClick={() => loadProfile()} className={styles['retry-button']}>
                    Попробовать снова
                </button>
            </div>
            </div>
        </div>
        );
    }
    
    const currentWorkouts = getCurrentCourseWorkouts();

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
                            {isLoadingWorkouts ? (
                                <div className={styles['no-workouts']}>
                                    <p>Загрузка тренировок...</p>
                                </div>
                            ) : currentWorkouts.length === 0 ? (
                                <div className={styles['no-workouts']}>
                                    <p>Нет доступных тренировок</p>
                                </div>
                            ) : (
                                currentWorkouts.map((workout) => {
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
                                })
                            )}
                        </div>


                        <button 
                            className={styles['workout-start-button']}
                            onClick={handleCloseModal}
                        >
                            {currentWorkouts.length > 0 ? 'Начать' : 'Закрыть'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}