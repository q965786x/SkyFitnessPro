'use client';

import Header from '@/components/Header/Header';
import styles from './page.module.css';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/services/storage';
import SigninModal from '@/components/AuthModal/SigninModal';
import SignupModal from '@/components/AuthModal/SignupModal';
import { 
    addCourseToUser, 
    getCourseById, 
    getUserCourses
} from '@/services/courses/coursesApi';
import { AxiosError } from 'axios';
import { useToast } from '@/hooks/useToast';
import CourseImage from '@/components/CourseImage/CourseImage';



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

export default function CoursePage() {
    const { showSuccess, showError, showLoading, dismiss } = useToast();
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
            console.log('Loading course with ID:', courseId);
            // Загружаем данные курса
            const courseData = await getCourseById(courseId);
            console.log('Received course data:', courseData);
            
            if (courseData && courseData._id) {
                setCourse(courseData);
            } else {
                console.error('Курс не найден для ID:', courseId);
                setCourse(null);
            }

            // Проверяем авторизацию
            const token = storage.getToken();
            setIsAuthorized(!!token);
        } catch (error) {
            console.error('Ошибка загрузки курса:', error);
            setCourse(null);
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);
    
    useEffect(() => {
        loadCourse();
    }, [loadCourse]);

    const handleAddCourse = async () => {
        if (!isAuthorized) {
            localStorage.setItem('pendingCourseId', courseId);
            setIsSigninModalOpen(true);
            return;
        }

        setIsAdding(true);
        const loadingToast = showLoading('Добавление курса...');

        try {
            const result = await addCourseToUser(courseId);
            console.log('Add course result:', result);
            
            // Обновляем список курсов пользователя
            const updatedCourses = await getUserCourses();
            storage.setUserCoursesIds(updatedCourses);
            
            dismiss(loadingToast);
            showSuccess('Курс успешно добавлен!');

            router.push(`/workout/course/${courseId}`);
            router.refresh();
        } catch (error) {
            dismiss(loadingToast);
            console.error('Ошибка добавления курса:', error);
            
            let errorMessage = 'Не удалось добавить курс';
            if (error instanceof AxiosError) {
                errorMessage = error.response?.data?.message || error.message || 'Не удалось добавить курс';
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            showError(errorMessage);
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
            <div className={styles['main-container']}>
                <div className={styles['page-content']}>
                    <Header />
                    <div className={styles.loading}>
                        <p>Загрузка курса...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className={styles['main-container']}>
                <div className={styles['page-content']}>
                    <Header />
                    <div className={styles.error}>
                        <h2>Курс не найден</h2>
                        <button 
                            className={styles.backButton}
                            onClick={() => router.push('/workout/main')} 
                        >
                            Вернуться на главную
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={styles['main-container']}>
                <div className={styles['page-content']}>
                    <Header onLoginClick={() => setIsSigninModalOpen(true)} />

                    <div className={styles['course-container']}>
                        {/* Баннер курса */}
                        <div className={styles['course-image-wrapper']}>
                            <CourseImage
                                nameEN={course.nameEN}
                                nameRU={course.nameRU}
                                type="banner"
                                width={1160}
                                height={310}
                                className={styles['course-image']}
                                priority={true}
                            />
                        </div>

                        {/* "Подойдет для вас, если:" */}
                        <div className={styles['section-label']}>Подойдет для вас, если:</div>
                        <div className={styles['features-row']}>
                            {course.fitting && course.fitting.map((item, index) => (
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
                                {course.directions && course.directions.map((direction, index) => (
                                    <span 
                                        key={index} 
                                        className={styles['direction-item']}
                                    >
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
                                        src="/img/Sportsman.png"
                                        alt={'sportsman'}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
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

                                {/* Десктоп изображение - абсолютно позиционировано */}
                                <div className={styles['desktop-image']}>
                                    <Image
                                        src="/img/Sportsman.png"
                                        alt="sportsman"
                                        fill
                                        className={styles['desktop-image-img']}
                                        sizes="487px"
                                        priority
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