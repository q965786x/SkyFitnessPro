'use client';

import Header from '@/components/Header/Header';
import styles from './page.module.css';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openSigninModal } from '@/store/slices/uiSlice';
import { 
    addCourse, 
    fetchCourseById, 
    fetchUserCourses 
} from '@/store/slices/coursesSlice';
import { useToast } from '@/utils/useToast';
import CourseImage from '@/components/CourseImage/CourseImage';
import SigninModal from '@/components/AuthModal/SigninModal';
import SignupModal from '@/components/AuthModal/SignupModal';

export default function CoursePage() {
    const { showSuccess, showError, showLoading, dismiss } = useToast();
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const courseId = params.id as string;
    
    const { currentCourse, userCoursesIds, isLoading: coursesLoading } = useAppSelector((state) => state.courses);
    const { isAuthorized } = useAppSelector((state) => state.auth);
    
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadCourse = useCallback(async () => {
        setIsLoading(true);
        try {
            await dispatch(fetchCourseById(courseId)).unwrap();
        } catch {
           
        } finally {
            setIsLoading(false);
        }
    }, [courseId, dispatch]);

    useEffect(() => {
        loadCourse();
    }, [loadCourse]);

    const handleAddCourse = async () => {
        if (!isAuthorized) {
            localStorage.setItem('pendingCourseId', courseId);
            dispatch(openSigninModal());
            return;
        }

        setIsAdding(true);
        const loadingToast = showLoading('Добавление курса...');

        try {
            await dispatch(addCourse(courseId)).unwrap();
            await dispatch(fetchUserCourses()).unwrap();
            
            dismiss(loadingToast);
            showSuccess('Курс успешно добавлен!');

            router.push(`/workout/course/${courseId}`);
            router.refresh();
        } catch {
            dismiss(loadingToast);            
            showError('Не удалось добавить курс');
        } finally {
            setIsAdding(false);
        }
    };

    const updateAuthState = async () => {
        await dispatch(fetchUserCourses()).unwrap();
        router.refresh();
    };

    const isCourseAdded = userCoursesIds.includes(courseId);

    if (isLoading || coursesLoading) {
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

    if (!currentCourse) {
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
                    <Header />

                    <div className={styles['course-container']}>                        
                        <div className={styles['course-image-wrapper']}>
                            <CourseImage
                                nameEN={currentCourse.nameEN}
                                nameRU={currentCourse.nameRU}
                                type="banner"
                                width={1160}
                                height={310}
                                className={styles['course-image']}
                                priority={true}
                            />
                        </div>
                       
                        <div className={styles['section-label']}>Подойдет для вас, если:</div>
                        <div className={styles['features-row']}>
                            {currentCourse.fitting && currentCourse.fitting.map((item, index) => (
                                <div key={index} className={styles['feature-card']}>
                                    <div className={styles['feature-content']}>
                                        <div className={styles['feature-number']}>{index + 1}</div>
                                        <div className={styles['feature-text']}>{item}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className={styles['directions-wrapper']}>
                            <h2 className={styles['directions-heading']}>Направления</h2>
                            <div className={styles['directions-full-block']}>
                                {currentCourse.directions && currentCourse.directions.map((direction, index) => (
                                    <span 
                                        key={index} 
                                        className={styles['direction-item']}
                                    >
                                        ✦ {direction}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className={styles['journey-wrapper']}>                            
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
                                            onClick={() => dispatch(openSigninModal())}
                                        >
                                            Войдите, чтобы добавить курс
                                        </button>
                                    ) : isCourseAdded ? (
                                        <button 
                                            className={styles['journey-button']}
                                            disabled={true}
                                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                        >
                                            Курс уже добавлен
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
                    </div>
                </div>
            </div>            
            <SigninModal onLoginSuccess={updateAuthState} />
            <SignupModal onLoginSuccess={updateAuthState} />
        </>
    );
}