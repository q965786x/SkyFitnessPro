'use client';

import Header from '@/components/Header/Header';
import styles from './page.module.css';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
    fetchWorkoutById, 
    fetchWorkoutProgress as fetchWorkoutProgressThunk,
    saveWorkout,
    updateLocalProgress
} from '@/store/slices/progressSlice';
import { fetchCourseById } from '@/store/slices/coursesSlice';
import { useToast } from '@/utils/useToast';
import { storage } from '@/services/storage';

type Exercise = {
    _id: string;
    name: string;
    quantity: number;
};

type WorkoutData = {
    _id: string;
    name: string;
    video: string;
    exercises: Exercise[];
};

const isWorkoutFullyCompleted = (progress: number[], exercises: Exercise[]): boolean => {
    if (!progress || progress.length === 0 || exercises.length === 0) return false;
    
    return progress.every((count, index) => {
        const exercise = exercises[index];
        if (!exercise) return false;
        return count >= exercise.quantity;
    });
};

export default function LessonPage() {
    const { showSuccess, showError, showLoading, dismiss } = useToast();
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const courseId = params.id as string;
    const workoutId = params.lessonId as string;

    const { currentCourse } = useAppSelector((state) => state.courses);
    const workoutProgress = useAppSelector((state) => 
        state.progress.workoutProgress[`${courseId}_${workoutId}`]
    );
    
    const [workout, setWorkout] = useState<WorkoutData | null>(null);
    const [courseTitle, setCourseTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [progressData, setProgressData] = useState<number[]>([]);
    const [workoutCompleted, setWorkoutCompleted] = useState(false);

    
    const loadWorkoutData = useCallback(async () => {
        try {            
            const workoutData = await dispatch(fetchWorkoutById(workoutId)).unwrap();
            
            if (!workoutData) {                
                setIsLoading(false);
                return;
            }
            setWorkout(workoutData);

            try {
                const result = await dispatch(fetchWorkoutProgressThunk({ courseId, workoutId })).unwrap();
                const progress = result?.progress;
                
                if (progress && progress.progressData) {
                    
                    setProgressData(progress.progressData);
                    const allCompleted = isWorkoutFullyCompleted(progress.progressData, workoutData.exercises);
                    
                    setWorkoutCompleted(allCompleted);
                } else {
                    const initialProgress = new Array(workoutData.exercises.length).fill(0);
                    
                    setProgressData(initialProgress);
                    setWorkoutCompleted(false);                    
                }
            } catch {                
                const initialProgress = new Array(workoutData.exercises.length).fill(0);
                
                setProgressData(initialProgress);
                setWorkoutCompleted(false);
            }

            if (!currentCourse || currentCourse._id !== courseId) {
                const courseData = await dispatch(fetchCourseById(courseId)).unwrap();
                
                if (courseData) {
                    setCourseTitle(courseData.nameRU);
                }
            } else {
                setCourseTitle(currentCourse.nameRU);
            }
        } catch  {
            
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, courseId, workoutId, currentCourse]);

    
    useEffect(() => {
        const token = storage.getToken();
        
        if (!token) {
            router.push('/workout/main');
            return;
        }
        
        loadWorkoutData();
    }, [router, loadWorkoutData]);

    
    useEffect(() => {
        if (workoutProgress && workout) {

            setProgressData(workoutProgress.progressData || []);
            
            const allCompleted = isWorkoutFullyCompleted(
                workoutProgress.progressData || [], 
                workout.exercises
            );
            setWorkoutCompleted(allCompleted);
        }
    }, [workoutProgress, workout]);

    const handleCountChange = (index: number, value: number) => {
        if (!workout) return;

        const newProgress = [...progressData];        
        const maxQuantity = workout?.exercises[index]?.quantity || 0;
        newProgress[index] = Math.min(value, maxQuantity);
        
        setProgressData(newProgress);        
        
        if (workout) {
            const allCompleted = isWorkoutFullyCompleted(newProgress, workout.exercises);
            dispatch(updateLocalProgress({
                courseId,
                workoutId,
                progressData: newProgress,
                workoutCompleted: allCompleted
            }));
        }
    };

    const handleSaveProgress = async () => {
        if (!workout) return;

        const loadingToast = showLoading('Сохранение прогресса...');
        
        try {            
            const allCompleted = isWorkoutFullyCompleted(progressData, workout.exercises);
            
            await dispatch(saveWorkout({ 
                courseId, 
                workoutId, 
                progressData 
            })).unwrap();

            setWorkoutCompleted(allCompleted);            
            setIsModalOpen(false);
            dismiss(loadingToast);

            showSuccess('Прогресс успешно сохранен!');
            setIsSuccessModalOpen(true);
            
            const key = `${courseId}_${workoutId}`;
            const updatedWorkouts = JSON.parse(localStorage.getItem('updatedWorkouts') || '{}');
            updatedWorkouts[key] = {
                progressData,
                workoutCompleted: allCompleted,
                timestamp: Date.now()
            };
            localStorage.setItem('updatedWorkouts', JSON.stringify(updatedWorkouts));

            localStorage.setItem('returnToProfile', 'true');            
            
            setTimeout(() => {
                router.push('/profile');
            }, 1500);
            

        } catch {
            dismiss(loadingToast);            
            showError('Не удалось сохранить прогресс');
        }
    };

    useEffect(() => {
        if (isSuccessModalOpen) {
            const timer = setTimeout(() => {
                setIsSuccessModalOpen(false);
            }, 2000);
            
            return () => clearTimeout(timer);
        }
    }, [isSuccessModalOpen]);
    
    const getProgressPercent = (current: number, max: number): number => {
        if (max === 0) return 0;
        return Math.round((current / max) * 100);
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

    if (!workout) {
        return (
        <div className={styles['main-container']}>
            <div className={styles['page-content']}>
            <Header />
            <div className={styles['error']}>
                <h2>Тренировка не найдена</h2>
                <p>Workout ID: {workoutId}</p>
                <p>Course ID: {courseId}</p>
                <button 
                    onClick={() => router.push(`/profile`)} 
                    className={styles['back-button']}
                >
                    Вернуться в профиль
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

            <h1 className={styles['course-name']}>{courseTitle}</h1>

            <div className={styles['video-container']}>
                <iframe
                    width="100%"
                    height="550"
                    src={workout.video}
                    title={workout.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>

            <div className={styles['exercises-section']}>
                <h2 className={styles['exercises-title']}>{workout.name}</h2>
            
                <div className={styles['exercises-grid']}>
                    <div className={styles['exercises-list']}>
                        {workout.exercises.map((exercise, index) => {
                            const currentProgress = progressData[index] || 0;
                            const percent = getProgressPercent(currentProgress, exercise.quantity);
                            return (
                                <div key={exercise._id} className={styles['exercise-item']}>
                                    <div className={styles['exercise-header']}>
                                        <span className={styles['exercise-name']}>
                                            {exercise.name}
                                        </span>
                                        <span className={styles['exercise-percent']}>
                                            {percent}%
                                        </span>
                                    </div>
                                    <div className={styles['progress-bar-container']}>
                                        <div 
                                            className={styles['progress-bar-fill-exercise']}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <div className={styles['exercise-stats']}>
                                        <span className={styles['exercise-current']}>
                                            {currentProgress}
                                        </span>
                                        <span className={styles['exercise-max']}>
                                            / {exercise.quantity} повторений
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                

                <button 
                    className={styles['fill-progress-button']}
                    onClick={() => setIsModalOpen(true)}
                >
                    {workoutCompleted ? 'Обновить прогресс' : 'Заполнить свой прогресс'}
                </button>              
                
                </div>
            </div>
           
            {isModalOpen && workout && (
                <div className={styles['modal-overlay']} onClick={() => setIsModalOpen(false)}>
                    <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles['modal-title']}>Мой прогресс</h2>
                        
                        <div className={styles['modal-content']}>
                            {workout.exercises.map((exercise, index) => (
                                <div key={exercise._id} className={styles['modal-exercise']}>
                                    <div className={styles['modal-exercise-name']}>
                                        Сколько раз вы сделали {exercise.name.toLowerCase()}?
                                        <br />
                                        <small>(максимум: {exercise.quantity})</small>
                                    </div>
                                    <div className={styles['modal-exercise-count']}>
                                        <span className={styles['count-label']}>Сделано раз:</span>
                                        <input
                                            type="number"
                                            className={styles['count-input']}
                                            value={progressData[index] || 0}
                                            onChange={(e) => handleCountChange(index, Math.min(parseInt(e.target.value) || 0, exercise.quantity))}
                                            min="0"
                                            max={exercise.quantity}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            className={styles['modal-save-button']}
                            onClick={handleSaveProgress}
                        >
                            Сохранить
                        </button>
                    </div>
                </div>
            )}
            
            {isSuccessModalOpen && (
                <div className={styles['modal-overlay']} onClick={() => setIsSuccessModalOpen(false)}>
                    <div className={styles['success-modal']} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles['success-title']}>Ваш прогресс засчитан!</h2>
                        <div className={styles['success-icon']}>✓</div>
                    </div>
                </div>
            )}
        </div>
    );
}