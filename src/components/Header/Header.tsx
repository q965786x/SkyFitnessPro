'use client';

import styles from './header.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth, logout } from '@/store/slices/authSlice';
import { openSigninModal } from '@/store/slices/uiSlice';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user, isAuthorized, isLoading } = useAppSelector((state) => state.auth);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const isProfilePage = pathname === '/profile';
    const isLessonPage = pathname?.includes('/lesson/');
    const hideSubtitle = isProfilePage || isLessonPage;    

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);    

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isModalOpen &&
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsModalOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isModalOpen]);
    
    const handleLogout = () => {
        dispatch(logout());
        setIsModalOpen(false);
        router.push('/workout/main');
    };

    const handleProfile = () => {
        setIsModalOpen(false);
        router.push('/profile');
    };

    const handleLoginClick = () => {
        const pathParts = pathname?.split('/');
        if (pathParts && pathParts[1] === 'workout' && pathParts[2] === 'course' && pathParts[3]) {
            localStorage.setItem('pendingCourseId', pathParts[3]);
        } else {
            localStorage.removeItem('pendingCourseId');
        }
        dispatch(openSigninModal());
    };

    const handleLogoClick = () => {
        router.push('/workout/main');
    };


    if (isLoading) {
        return (
            <div className={styles['header-nav']}>
                <div className={styles['logo-area']}>
                    <div 
                        className={styles.logo}
                        onClick={handleLogoClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <Image
                            width={220}
                            height={35}
                            className={styles['logo__image']}
                            src="/img/logo.png"
                            alt={'logo'}
                            priority
                        />
                    </div>
                    {!hideSubtitle && (
                        <div className={styles['logo-subtitle']}>Онлайн-тренировки для занятий дома</div>
                    )}
                </div>
                <div className={styles['loading-placeholder']}></div>
            </div>
        );
    }

    
    if (!isAuthorized || !user) {
        return (
            <div className={styles['header-nav']}>
                <div className={styles['logo-area']}>
                    <div 
                        className={styles.logo}
                        onClick={handleLogoClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <Image
                            width={220}
                            height={35}
                            className={styles['logo__image']}
                            src="/img/logo.png"
                            alt={'logo'}
                        />
                    </div>
                    {!hideSubtitle && (
                        <div className={styles['logo-subtitle']}>Онлайн-тренировки для занятий дома</div>
                    )}
                </div>
                <button 
                    className={styles['login-btn']} 
                    onClick={handleLoginClick}
                >
                    Войти
                </button>
            </div>
        );
    }
    
    // Если пользователь авторизован - показываем имя, аватар и треугольник
    return (
        <div className={styles['header-nav']}>
            <div className={styles['logo-area']}>
                <div 
                    className={styles.logo}
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                >
                    <Image
                        width={220}
                        height={35}
                        className={styles['logo__image']}
                        src="/img/logo.png"
                        alt={'logo'}
                    />
                </div>
                {!hideSubtitle && (
                    <div className={styles['logo-subtitle']}>Онлайн-тренировки для занятий дома</div>
                )}
            </div>

            <div className={styles['user-info']}>                
                <div 
                    className={styles['user-avatar']}
                    onClick={() => setIsModalOpen(!isModalOpen)}
                    style={{cursor: 'pointer'}}
                >
                    <Image
                        width={40}
                        height={40}
                        src="/img/Profile-littleIcon.png"
                        alt="profile"
                    />
                </div>
                <span 
                    className={styles['user-name']}
                    onClick={() => setIsModalOpen(!isModalOpen)}
                    style={{ cursor: 'pointer' }}
                >
                    {user.name}
                </span>
                <button
                    ref={buttonRef}
                    className={`${styles['dropdown-btn']} ${isModalOpen ? styles['active'] : ''}`}
                    onClick={() => setIsModalOpen(!isModalOpen)}
                >
                    <Image
                        width={8}
                        height={8}
                        src="/img/triangle.png"
                        alt="triangle"
                    />
                </button>

                {isModalOpen && (
                    <div ref={modalRef} className={styles['modal']}>
                        <div className={styles['modal-user-name']}>{user.name}</div>
                        <div className={styles['modal-user-email']}>{user.email}</div>
                        <button className={styles['modal-btn-profile']} onClick={handleProfile}>
                            Мой профиль
                        </button>
                        <button className={styles['modal-btn-logout']} onClick={handleLogout}>
                            Выйти
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}