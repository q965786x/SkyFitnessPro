'use client';

import Header from '@/src/components/Header/Header';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Image from 'next/image';

type Exercise = {
    id: string;
    name: string;
    progress: number;
    count?: number;
};

type LessonData = {
    id: string;
    title: string;
    imageUrl: string;
    exercises: Exercise[];
};

// Данные уроков для разных курсов
const lessonsData: Record<string, Record<string, LessonData>> = {
    '1': { // Йога
        '1': {
            id: '1',
            title: 'Йога для начинающих',
            imageUrl: '/img/Video.png',
            exercises: [
                { id: '1', name: 'Наклоны вперед', progress: 0, count: 0 },
                { id: '2', name: 'Наклоны назад', progress: 0, count: 0 },
                { id: '3', name: 'Поднятие ног, согнутых в коленях', progress: 0, count: 0 },
                { id: '4', name: 'Наклоны вперед', progress: 0, count: 0 },
                { id: '5', name: 'Наклоны назад', progress: 0, count: 0 },
                { id: '6', name: 'Поднятие ног, согнутых в коленях', progress: 0, count: 0 },
                { id: '7', name: 'Наклоны вперед', progress: 0, count: 0 },
                { id: '8', name: 'Наклоны назад', progress: 0, count: 0 },                
                { id: '9', name: 'Поднятие ног, согнутых в коленях', progress: 0, count: 0 },
            ]
        }
    },
    '2': { // Стретчинг
        '1': {
            id: '1',
            title: 'Стретчинг для всего тела',
            imageUrl: '/img/Video.png',
            exercises: [
                { id: '1', name: 'Наклоны вперед', progress: 0, count: 0 },
                { id: '2', name: 'Наклоны назад', progress: 0, count: 0 },
                { id: '3', name: 'Поднятие ног, согнутых в коленях', progress: 0, count: 0 },
                { id: '4', name: 'Наклоны вперед', progress: 0, count: 0 },
                { id: '5', name: 'Наклоны назад', progress: 0, count: 0 },
                { id: '6', name: 'Поднятие ног, согнутых в коленях', progress: 0, count: 0 },
                { id: '7', name: 'Наклоны вперед', progress: 0, count: 0 },
                { id: '8', name: 'Наклоны назад', progress: 0, count: 0 },                
                { id: '9', name: 'Поднятие ног, согнутых в коленях', progress: 0, count: 0 },
            ]
        }
    },
    '3': { // Фитнес
        '1': {
            id: '1',
            title: 'Фитнес для начинающих',
            imageUrl: '/img/Video.png',
            exercises: [
                { id: '1', name: 'Наклоны вперед', progress: 0, count: 0 },
                { id: '2', name: 'Наклоны назад', progress: 0, count: 0 },
                { id: '3', name: 'Поднятие ног, согнутых в коленях', progress: 0, count: 0 },
                { id: '4', name: 'Наклоны вперед', progress: 0, count: 0 },
                { id: '5', name: 'Наклоны назад', progress: 0, count: 0 },
                { id: '6', name: 'Поднятие ног, согнутых в коленях', progress: 0, count: 0 },
                { id: '7', name: 'Наклоны вперед', progress: 0, count: 0 },
                { id: '8', name: 'Наклоны назад', progress: 0, count: 0 },                
                { id: '9', name: 'Поднятие ног, согнутых в коленях', progress: 0, count: 0 },
            ]
        }
    }
};

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [courseTitle, setCourseTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [hasProgress, setHasProgress] = useState(false); // Флаг для отслеживания наличия прогресса

    useEffect(() => {
        const loadLessonData = () => {
            const courseId = params.id as string;
            const lessonId = params.lessonId as string;
            
            // Названия курсов
            const courseTitles: Record<string, string> = {
                '1': 'Йога',
                '2': 'Стретчинг',
                '3': 'Фитнес',
                '4': 'Степ-аэробика',
                '5': 'Бодифлекс',
            };
            
            if (courseId && lessonsData[courseId] && lessonsData[courseId][lessonId]) {
                const loadedLesson = lessonsData[courseId][lessonId];
                setLesson(loadedLesson);
                setCourseTitle(courseTitles[courseId] || 'Курс');

                // Инициализируем счетчики
                const initialCounts: Record<string, number> = {};
                loadedLesson.exercises.forEach(ex => {
                    initialCounts[ex.id] = ex.count || 0;
                });
                setCounts(initialCounts);

                // Проверяем, есть ли уже прогресс
                const hasAnyProgress = loadedLesson.exercises.some(ex => ex.progress > 0);
                setHasProgress(hasAnyProgress);
            }
            setIsLoading(false);
        };
        
        loadLessonData();
    }, [params.id, params.lessonId]);

    const handleExerciseClick = (exerciseId: string) => {
        if (lesson) {
            const updatedExercises = lesson.exercises.map(exercise =>
                exercise.id === exerciseId
                    ? { ...exercise, progress: exercise.progress === 0 ? 100 : 0 }
                    : exercise
            );
            setLesson({ ...lesson, exercises: updatedExercises });

            // Проверяем, есть ли прогресс после обновления
            const hasAnyProgress = updatedExercises.some(ex => ex.progress > 0);

            setHasProgress(hasAnyProgress);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
    };

    const handleCountChange = (exerciseId: string, value: number) => {
        setCounts(prev => ({
            ...prev,
            [exerciseId]: value
        }));
    };

    const handleSaveProgress = () => {
        if (lesson) {
            // Обновляем прогресс на основе введенных счетчиков
            const updatedExercises = lesson.exercises.map(exercise => ({
                ...exercise,
                count: counts[exercise.id] || 0,
                progress: (counts[exercise.id] || 0) > 0 ? 100 : 0
            }));
            setLesson({ ...lesson, exercises: updatedExercises });

            // Проверяем, есть ли прогресс
            const hasAnyProgress = updatedExercises.some(ex => ex.progress > 0);
            setHasProgress(hasAnyProgress);


            // Закрываем первое модальное окно и открываем окно успеха
            setIsModalOpen(false);
            setIsSuccessModalOpen(true);
        }
    }; 

    const handleBackToCourse = () => {
        router.push(`/workout/course/${params.id}`);
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

    if (!lesson) {
        return (
            <div className={styles['main-container']}>
                <div className={styles['page-content']}>
                    <Header />
                    <div className={styles['error']}>
                        <h2>Урок не найден</h2>
                        <button onClick={handleBackToCourse} className={styles['back-button']}>
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

                {/* Название курса/урока */}
                <h1 className={styles['course-name']}>{courseTitle}</h1>

                {/* Фотоблок вместо видео */}
                <div className={styles['image-container']}>
                    <Image
                        width={1160}
                        height={550}
                        className={styles['course-image']}
                        src={lesson.imageUrl}
                        alt={lesson.title}
                    />
                </div>

                {/* Блок с упражнениями */}
                <div className={styles['exercises-section']}>
                    <h2 className={styles['exercises-title']}>Упражнения тренировки 2</h2>
                    
                    <div className={styles['exercises-grid']}>
                        {lesson.exercises.map((exercise) => (
                            <div 
                                key={exercise.id} 
                                className={`${styles['exercise-card']} ${exercise.progress === 100 ? styles['completed'] : ''}`}
                                onClick={() => handleExerciseClick(exercise.id)}
                            >
                                <span className={styles['exercise-name']}>{exercise.name}</span>
                                <span className={styles['exercise-progress']}>{exercise.progress}%</span>
                            </div>
                        ))}
                    </div>

                    {/* Кнопка "Заполнить свой прогресс" */}
                    <button 
                        className={styles['fill-progress-button']}
                        onClick={handleOpenModal}
                    >
                        {hasProgress ? 'Обновить свой прогресс' : 'Заполнить свой прогресс'}
                    </button>
                </div>
            </div>

            {/* Модальное окно для заполнения прогресса */}
            {isModalOpen && (
                <div className={styles['modal-overlay']} onClick={handleCloseModal}>
                    <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles['modal-title']}>Мои прогресс</h2>
                        
                        <div className={styles['modal-content']}>
                            {lesson.exercises.map((exercise) => (
                                <div key={exercise.id} className={styles['modal-exercise']}>
                                    <div className={styles['modal-exercise-name']}>
                                        Сколько раз вы сделали {exercise.name.toLowerCase()}?
                                    </div>
                                    <div className={styles['modal-exercise-count']}>
                                        <span className={styles['count-label']}>Сделано раз:</span>
                                        <input
                                            type="number"
                                            className={styles['count-input']}
                                            value={counts[exercise.id] || 0}
                                            onChange={(e) => handleCountChange(exercise.id, parseInt(e.target.value) || 0)}
                                            min="0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            className={styles['modal-save-button']}
                            onClick={handleSaveProgress}
                        >
                            Сохранять
                        </button>
                    </div>
                </div>
            )}

            {/* Модальное окно успеха "Ваш прогресс засчитан" */}
            {isSuccessModalOpen && (
                <div className={styles['modal-overlay']} onClick={handleCloseSuccessModal}>
                    <div className={styles['success-modal']} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles['success-title']}>Ваш прогресс засчитан!</h2>
                        <div className={styles['success-icon']}>✓</div>                         
                    </div>
                </div>
            )}
        </div>
    );
}