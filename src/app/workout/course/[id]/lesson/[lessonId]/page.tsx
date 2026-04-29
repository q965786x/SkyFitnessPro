'use client';

import Header from '@/components/Header/Header';
import styles from './page.module.css';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { storage } from '@/services/storage';
import { 
    getCourseById, 
    getWorkoutById, 
    getWorkoutProgress, 
    saveWorkoutProgress 
} from '@/services/courses/coursesApi'; 
import { useToast } from '@/hooks/useToast';

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

export default function LessonPage() {
    const { showSuccess, showError, showLoading, dismiss } = useToast();
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const workoutId = params.lessonId as string;

    const [workout, setWorkout] = useState<WorkoutData | null>(null);
    const [courseTitle, setCourseTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [progressData, setProgressData] = useState<number[]>([]);
    const [workoutCompleted, setWorkoutCompleted] = useState(false);

    useEffect(() => {
        const loadData = async () => {
        try {
            const token = storage.getToken();
            if (!token) {
            router.push('/workout/main');
            return;
            }
            
            // Загружаем данные тренировки - теперь getWorkoutById возвращает данные напрямую
            const workoutData = await getWorkoutById(workoutId);
            if (!workoutData) {
                console.error('Тренировка не найдена');
                setIsLoading(false);
                return;
            }
            setWorkout(workoutData);

            // Загружаем прогресс по тренировке - теперь getWorkoutProgress возвращает данные напрямую
            try {
                const progress = await getWorkoutProgress(courseId, workoutId);
                if (progress) {
                    setProgressData(progress.progressData || new Array(workoutData.exercises.length).fill(0));
                    setWorkoutCompleted(progress.workoutCompleted);
                } else {
                    setProgressData(new Array(workoutData.exercises.length).fill(0));
                    setWorkoutCompleted(false);
                }
            } catch (error) {
                // Если прогресса нет — создаем массив из нулей
                console.log('Прогресс не найден, создаем новый:', error);
                setProgressData(new Array(workoutData.exercises.length).fill(0));
                setWorkoutCompleted(false);
            }

            // Загружаем название курса - теперь getCourseById возвращает данные напрямую
            const courseData = await getCourseById(courseId);
            if (courseData) {
                setCourseTitle(courseData.nameRU);
            }
            
            } catch (error) {
                console.error('Ошибка загрузки:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [courseId, workoutId, router]);

    const handleCountChange = (index: number, value: number) => {
        const newProgress = [...progressData];
        newProgress[index] = value;
        setProgressData(newProgress);
    };

    const handleSaveProgress = async () => {
        if (!workout) return;

        const loadingToast = showLoading('Сохранение прогресса...');
        
        try {
            await saveWorkoutProgress(courseId, workoutId, progressData);
            
            // Проверяем, завершена ли тренировка (все упражнения > 0)
            const allCompleted = progressData.every(count => count > 0);
            setWorkoutCompleted(allCompleted);
            
            // ОБНОВЛЯЕМ КЭШ ПРОГРЕССА В STORAGE
            // Сохраняем информацию о том, что тренировка обновлена
            const updatedWorkouts = JSON.parse(localStorage.getItem('updatedWorkouts') || '{}');
            updatedWorkouts[`${courseId}_${workoutId}`] = {
                progressData,
                workoutCompleted: allCompleted,
                timestamp: Date.now()
            };
            localStorage.setItem('updatedWorkouts', JSON.stringify(updatedWorkouts));
            
            setIsModalOpen(false);
            dismiss(loadingToast);
            showSuccess('Прогресс успешно сохранен!');
            setIsSuccessModalOpen(true);            
        } catch (error) {
            dismiss(loadingToast);
            console.error('Ошибка сохранения прогресса:', error);
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

    useEffect(() => {
        return () => {
            // При уходе со страницы проверяем, нужно ли обновить профиль
            const returnToProfile = localStorage.getItem('returnToProfile');
            if (returnToProfile === 'true') {
                // Флаг уже установлен, ничего не делаем
                console.log('Будет обновлен профиль при возврате');
            }
        };
    }, []);

    // Функция для вычисления процента выполнения упражнения
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
                <button 
                    onClick={() => router.push(`/workout/course/${courseId}`)} 
                    className={styles['back-button']}
                >
                    Вернуться к курсу
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

            {/* Видео */}
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
            
                {/* Список упражнений с progress bar */}
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

            {/* Модальное окно для заполнения прогресса */}
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

            {/* Модальное окно успеха */}
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