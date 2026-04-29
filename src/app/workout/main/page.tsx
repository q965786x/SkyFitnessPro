'use client';

import styles from './page.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/services/storage';
import SigninModal from '@/components/AuthModal/SigninModal';
import SignupModal from '@/components/AuthModal/SignupModal';
import { 
  getAllCourses, 
  getUserCourses 
} from '@/services/courses/coursesApi';
import { logoutUser } from '@/services/auth/authApi';
import CourseImage from '@/components/CourseImage/CourseImage';
import { sortCoursesByOrder } from '@/utils/courseSort';

type Course = {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  difficulty?: string;
  durationInDays?: number;
  dailyDurationInMinutes?: { from: number; to: number };
  workouts: string[];
};

export default function MainPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userCoursesIds, setUserCoursesIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Функция загрузки данных
  const loadData = async () => {
    try {
      // Проверка авторизации
      const token = storage.getToken();
      const isAuth = !!token;
      setIsAuthorized(isAuth);

      if (isAuth) {
        const userCourses = await getUserCourses();
        setUserCoursesIds(userCourses);        
      } else {
        setUserCoursesIds([]);
      }
      
      // Загружаем все курсы
      const coursesData = await getAllCourses();
      console.log('Loaded courses:', coursesData);
      
      if (Array.isArray(coursesData) && coursesData.length > 0) {
        const sortedCourses = sortCoursesByOrder(coursesData);
        setCourses(sortedCourses);
      } else {
        console.warn('Нет данных о курсах или пустой массив');
        setCourses([]);
      }
      
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


    // Функция скролла наверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Функция handleLogout
  const handleLogout = () => {
    logoutUser();
    setIsAuthorized(false);
    setUserCoursesIds([]);
    router.refresh();
  };

  // При клике на иконку - переходим на страницу курса
  const handleCardClick = (courseId: string) => {
    router.push(`/workout/course/${courseId}`);
  };

  // Обработчик клика по иконке - останавливаем всплытие и переходим на страницу курса
  const handleIconClick = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation(); // Останавливаем всплытие, чтобы не сработал клик по карточке
    router.push(`/workout/course/${courseId}`);
  };

  const isCourseAdded = (courseId: string) => userCoursesIds.includes(courseId);

  // Обновление состояния после успешного входа
  const handleLoginSuccess = async () => {
    const token = storage.getToken();
    setIsAuthorized(!!token);
    if (token) {
      const userCourses = await getUserCourses();
      setUserCoursesIds(userCourses);
    }
    setIsSigninModalOpen(false);
    router.refresh();
  };
  
  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }
    
  return (
    <>
      <div className={styles['main-container']}>
        <div className={styles['page-content']}>          
          <div className={styles['header-nav']}>
            <div className={styles['logo-area']}>
              <div className={styles.logo}>
                <Image 
                  width={220}
                  height={35}
                  className={styles['logo__image']}
                  src="/img/logo.png"
                  alt={'logo'}
                  loading="eager"
                  priority
                />
              </div>
              <div className={styles['logo-subtitle']}>
                Онлайн-тренировки для занятий дома
              </div>
            </div>
            {isAuthorized ? (
              <button 
                className={styles['logout-btn']} 
                onClick={handleLogout}
              >
                Выйти
              </button>
            ) : (
              <button 
                className={styles['login-btn']} 
                onClick={() => setIsSigninModalOpen(true)}
              >
                Войти
              </button>
            )}
          </div>
          
          <div className={styles['title-section']}>
            <h1 className={styles['main-title']}>Начните заниматься спортом и улучшите качество жизни</h1>
            <div className={styles['info-badge']}>
              <Image 
                  width={288}
                  height={120}
                  className={styles['info-badge__image']}
                  src="/img/badge.png"
                  alt={'badge'}
                  loading="eager"
                />
            </div>
          </div>

          
          <div className={styles['cards']}>
            {courses.length === 0 ? (
              <div className={styles['no-courses']}>
                <p>Нет доступных курсов</p>
              </div>
              ) : (courses.map((course) => {
                const added = isAuthorized && isCourseAdded(course._id);
                return (
                  <div 
                    key={course._id} 
                    className={styles.card}
                    onClick={() => handleCardClick(course._id)}
                    style={{ cursor: 'pointer' }}
                  >
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
                        className={`${styles['add-icon-wrapper']} ${added ? styles['disabled'] : ''}`}
                        onClick={(e) => handleIconClick(e, course._id)}
                      >
                        {added ? (
                          // Иконка галочки для добавленных курсов
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          // Иконка плюса для недобавленных курсов
                          <Image 
                            width={32}
                            height={32}
                            className={styles['add-icon-image']}
                            src="/img/Add-icon.png"
                            alt="add-icon"
                          />
                        )}
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
                              src="/img/calendar-icon.png" 
                              alt="calendar" 
                            />
                            <span>{course.durationInDays || 25} дней</span>
                          </button>
                          <button className={styles['btn-time']}>
                            <Image 
                              width={18} 
                              height={18} 
                              src="/img/time-icon.png" 
                              alt="time" 
                            />
                            <span>
                              {course.dailyDurationInMinutes?.from || 20}-{course.dailyDurationInMinutes?.to || 50} мин/день
                            </span>
                          </button>
                        </div>
                        <button className={styles['btn-difficulty']}>
                          <Image 
                            width={18} 
                            height={18} 
                            src="/img/diagram-icon.png" 
                            alt="difficulty" />
                          <span>Сложность: {course.difficulty || 'средний'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Кнопка "Вверх" */}
          <div className={styles['footer-btn']}>
              <button className={styles['scroll-to-top']} onClick={scrollToTop}>
                <span>Вверх</span>
                <span className={styles['arrow-up']}>↑</span>
              </button>
            </div>
          </div>
        </div>

        <SigninModal 
          isOpen={isSigninModalOpen}
          onClose={() => setIsSigninModalOpen(false)}
          onSwitchToSignup={() => {
            setIsSigninModalOpen(false);
            setIsSignupModalOpen(true);
          }}
          onLoginSuccess={handleLoginSuccess}
        />

        <SignupModal 
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          onSwitchToSignin={() => {
            setIsSignupModalOpen(false);
            setIsSigninModalOpen(true);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
    </>
  );
}