'use client';

import Header from '@/components/Header/Header';
import styles from './page.module.css';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getWorkout, getCourse, getWorkoutProgress, saveWorkoutProgress } from '@/services/api';
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

export default function LessonPage() {
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
            router.push('/auth/signin');
            return;
            }
            
            // Загружаем данные тренировки
            const workoutResponse = await getWorkout(workoutId);
            const workoutData = workoutResponse.data;
            setWorkout(workoutData);

            // Загружаем прогресс по тренировке
                try {
                    const progressResponse = await getWorkoutProgress(courseId, workoutId);
                    const progress = progressResponse.data;
                    setProgressData(progress.progressData || new Array(workoutData.exercises.length).fill(0));
                    setWorkoutCompleted(progress.workoutCompleted);
                } catch (error) {
                    // Если прогресса нет — создаем массив из нулей
                    console.log('Прогресс не найден, создаем новый:', error);
                    setProgressData(new Array(workoutData.exercises.length).fill(0));
                }

            // Загружаем название курса
            const courseResponse = await getCourse(courseId);
            const courseData = courseResponse.data;
            setCourseTitle(courseData.nameRU);
            
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
        
        try {
        await saveWorkoutProgress(courseId, workoutId, progressData);
        
        // Проверяем, завершена ли тренировка (все упражнения > 0)
        const allCompleted = progressData.every(count => count > 0);
        setWorkoutCompleted(allCompleted);
        
        setIsModalOpen(false);
        setIsSuccessModalOpen(true);
        
        // Автоматически закрываем окно успеха через 2 секунды
        setTimeout(() => {
            setIsSuccessModalOpen(false);
        }, 2000);
        } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Не удалось сохранить прогресс');
        }
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
            
                <div className={styles['exercises-grid']}>
                    {workout.exercises.map((exercise, index) => (
                    <div 
                        key={exercise._id} 
                        className={`${styles['exercise-card']} ${progressData[index] > 0 ? styles['completed'] : ''}`}
                    >
                        <span className={styles['exercise-name']}>
                        {exercise.name} ({exercise.quantity} повторений)
                        </span>
                        <span className={styles['exercise-progress']}>
                        {progressData[index] || 0} / {exercise.quantity}
                        </span>
                    </div>
                    ))}
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