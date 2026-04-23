'use client';

import Header from '@/components/Header/Header';
import styles from './page.module.css';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/services/storage';
import { getCourse, addCourseToUser } from '@/services/api';
import SigninModal from '@/components/AuthModal/SigninModal';
import SignupModal from '@/components/AuthModal/SignupModal';

type Course = {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  difficulty: string;
  durationInDays: number;
  dailyDurationInMinutes: { from: number; to: number };
  workouts: string[];
};

// Маппинг изображений
const getImagePath = (nameEN: string, type: 'card' | 'banner' = 'banner'): string => {
  const imageMap: Record<string, string> = {
    'Yoga': type === 'banner' ? '/img/Yoga-course.png' : '/img/Yoga.png',
    'Stretching': type === 'banner' ? '/img/Stretching-course.png' : '/img/Stretching.png',
    'Fitness': type === 'banner' ? '/img/Fitness-course.png' : '/img/Fitness.png',
    'StepAerobics': type === 'banner' ? '/img/Step-course.png' : '/img/Step.png',
    'Bodyflex': type === 'banner' ? '/img/Bodyflex-course.png' : '/img/Bodyflex.png',
  };
  return imageMap[nameEN] || (type === 'banner' ? '/img/Yoga-course.png' : '/img/Yoga.png');
};

export default function CoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    
    const [course, setCourse] = useState<Course | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const loadCourse = useCallback(async () => {
        setIsLoading(true);
        try {
            // Загружаем данные курса
            const courseResponse = await getCourse(courseId);
            setCourse(courseResponse.data);
            
            // Проверяем авторизацию
            const token = storage.getToken();
            setIsAuthorized(!!token);
        } catch (error) {
            console.error('Ошибка загрузки курса:', error);
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);
    
    useEffect(() => {
        loadCourse();
    }, [loadCourse]);

    const handleAddCourse = async () => {
        if (!isAuthorized) {
            // Сохраняем ID курса для добавления после авторизации
            localStorage.setItem('pendingCourseId', courseId);
            setIsSigninModalOpen(true);
            return;
        }

        setIsAdding(true);
        try {
            await addCourseToUser(courseId);
            alert('Курс успешно добавлен!');
            // После добавления перенаправляем на страницу тренировок курса
            router.push(`/workout/course/${courseId}`);
        } catch (error) {
            console.error('Ошибка добавления курса:', error);
            alert('Не удалось добавить курс');
        } finally {
            setIsAdding(false);
        }
    };

    const updateAuthState = async () => {
        // Обновляем состояние авторизации
        const token = storage.getToken();
        setIsAuthorized(!!token);
        // Перезагружаем страницу, чтобы обновить состояние
        router.refresh();
    };

    if (isLoading) {
        return (
        <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Загрузка курса...</p>
        </div>
        );
    }

    if (!course) {
        return (
        <div className={styles.error}>
            <h2>Курс не найден</h2>
            <button 
                onClick={() => router.push('/workout/main')} 
                className={styles.backButton}
            >
                Вернуться на главную
            </button>
        </div>
        );
    }

    return (
        <>
            <div className={styles['main-container']}>
                <div className={styles['page-content']}>
                    <Header />

                    <div className={styles['course-container']}>
                        {/* Баннер курса */}
                        <div className={styles['course-image-wrapper']}>
                            <Image
                                width={1160}
                                height={310}
                                className={styles['course-image']}
                                src={getImagePath(course.nameEN, 'banner')}
                                alt={course.nameRU}
                            />
                        </div>

                        {/* "Подойдет для вас, если:" */}
                        <div className={styles['section-label']}>Подойдет для вас, если:</div>
                        <div className={styles['features-row']}>
                            {course.fitting.map((item, index) => (
                                <div key={index} className={styles['feature-card']}>
                                    <div className={styles['feature-content']}>
                                        <div className={styles['feature-number']}>{index + 1}</div>
                                        <div className={styles['feature-text']}>{item}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Направления */}
                        <div className={styles['directions-wrapper']}>
                            <h2 className={styles['directions-heading']}>Направления</h2>
                            <div className={styles['directions-full-block']}>
                                {course.directions.map((direction, index) => (
                                    <span key={index} className={styles['direction-item']}>
                                        ✦ {direction}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Двойной блок - Начните путь к новому телу */}
                        <div className={styles['journey-wrapper']}>
                            {/* Изображение для мобильных (видно только на mobile/tablet) */}
                            <div className={styles['mobile-image']}>
                                <div className={styles['mobile-image-placeholder']}>
                                    <Image
                                        src={getImagePath(course.nameEN, 'card')}
                                        alt={course.nameRU}
                                        fill
                                        className={styles['mobile-image-img']}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            </div>

                            {/* Белый блок с тенью */}
                            <div className={styles['journey-card']}>
                                <div className={styles['journey-content']}>
                                    <h2 className={styles['journey-title']}>
                                        Начните путь к новому телу
                                    </h2>
                                    <ul className={styles['journey-list']}>
                                        <li>проработка всех групп мышц</li>
                                        <li>тренировка суставов</li>
                                        <li>улучшение циркуляции крови</li>
                                        <li>упражнения заряжают бодростью</li>
                                        <li>помогают противостоять стрессам</li>
                                    </ul>
                                    
                                    {!isAuthorized ? (
                                        <button 
                                            className={styles['journey-button']}
                                            onClick={() => setIsSigninModalOpen(true)}
                                        >
                                            Войдите, чтобы добавить курс
                                        </button>
                                    ) : (
                                        <button 
                                            className={styles['journey-button']}
                                            onClick={handleAddCourse}
                                            disabled={isAdding}
                                        >
                                            {isAdding ? 'Добавление...' : 'Добавить курс'}
                                        </button>                                    
                                    )}
                                </div>

                                {/* Десктоп изображение (только на lg+) */}
                                <div className={styles['desktop-image']}>
                                    <Image
                                        src={getImagePath(course.nameEN, 'card')}
                                        alt={course.nameRU}
                                        fill
                                        className={styles['desktop-image-img']}
                                        sizes="487px"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Модальные окна авторизации */}
                        <SigninModal 
                            isOpen={isSigninModalOpen}
                            onClose={() => setIsSigninModalOpen(false)}
                            onSwitchToSignup={() => {
                                setIsSigninModalOpen(false);
                                setIsSignupModalOpen(true);
                            }}
                            onLoginSuccess={updateAuthState}
                        />

                        <SignupModal 
                            isOpen={isSignupModalOpen}
                            onClose={() => setIsSignupModalOpen(false)}
                            onSwitchToSignin={() => {
                                setIsSignupModalOpen(false);
                                setIsSigninModalOpen(true);
                            }}
                            onLoginSuccess={updateAuthState}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}