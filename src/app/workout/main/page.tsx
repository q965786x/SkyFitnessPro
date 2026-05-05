'use client';

import styles from './page.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openSigninModal } from '@/store/slices/uiSlice';
import { sortCoursesByOrder } from '@/utils/courseSort';
import { 
  fetchAllCourses, 
  fetchUserCourses 
} from '@/store/slices/coursesSlice';
import { logout } from '@/store/slices/authSlice';
import CourseImage from '@/components/CourseImage/CourseImage';
import SigninModal from '@/components/AuthModal/SigninModal';
import SignupModal from '@/components/AuthModal/SignupModal';
import dynamic from 'next/dynamic';
import 'react-loading-skeleton/dist/skeleton.css';

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

const MainPageSkeleton = dynamic(
  () => import('@/components/Skeleton/MainPageSkeleton'),
  { ssr: false }
);

export default function MainPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { allCourses, userCoursesIds, isLoading: coursesLoading } = useAppSelector((state) => state.courses);
  const { isAuthorized, isLoading: authLoading } = useAppSelector((state) => state.auth);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchAllCourses()).unwrap();
        
        if (isAuthorized) {
          await dispatch(fetchUserCourses()).unwrap();
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [dispatch, isAuthorized]);
    
  
  useEffect(() => {
    if (allCourses.length > 0) {
      const sortedCourses = sortCoursesByOrder(allCourses);
      setCourses(sortedCourses);
    }
  }, [allCourses]);
  
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  
  const handleLogout = () => {
    dispatch(logout());
    router.push('/workout/main');
  };

  
  const handleCardClick = (courseId: string) => {
    router.push(`/workout/course/${courseId}`);
  };

  
  const handleIconClick = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();

    localStorage.setItem('pendingCourseId', courseId);    
    router.push(`/workout/course/${courseId}`);
  };

  const isCourseAdded = (courseId: string) => userCoursesIds.includes(courseId);

  const handleLoginSuccess = async () => {
    await dispatch(fetchUserCourses()).unwrap();
    router.refresh();
  };

  const isLoading = isInitialLoading || coursesLoading || authLoading;

  if (isLoading) { 
    return (
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
                  onClick={() => dispatch(openSigninModal())}
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

            {/* Скелетон показывается только при загрузке */}
            <MainPageSkeleton />
          </div>
        </div>
      );
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
                onClick={() => dispatch(openSigninModal())}
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
                  priority={true}
                />
                      
                <div 
                  className={`${styles['add-icon-wrapper']} ${added ? styles['disabled'] : ''}`}
                  onClick={(e) => handleIconClick(e, course._id)}
                >
                  {added ? (                    
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (                    
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
      
      <div className={styles['footer-btn']}>
            <button className={styles['scroll-to-top']} onClick={scrollToTop}>
              <span>Вверх</span>
              <span className={styles['arrow-up']}>↑</span>
            </button>
          </div>
        </div>
      </div>

      <SigninModal onLoginSuccess={handleLoginSuccess} />
      <SignupModal onLoginSuccess={handleLoginSuccess} />
    </>
  );
}