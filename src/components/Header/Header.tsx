'use client';

import styles from './header.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '@/services/storage';
import { getMe } from '@/services/api';

type UserProps = {
    name: string;
    email: string;
};

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserProps | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const modalRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Определяем, нужно ли скрывать подзаголовок
    // Скрываем только на странице профиля и на странице урока
    const isProfilePage = pathname === '/profile';
    const isLessonPage = pathname?.includes('/lesson/');
    const hideSubtitle = isProfilePage || isLessonPage;

    useEffect(() => {
        const checkAuth = async () => {
            const token = storage.getToken();
            if (token) {
                try {
                    const response = await getMe(); // Получаем axios response
                    const userData = response.data; // Берем .data
                    setUser({
                        name: userData.email.split('@')[0],
                        email: userData.email,
                    });
                } catch (error) {
                    // Токен невалидный
                    console.error('Ошибка авторизации:', error);
                    storage.clearAll();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
            
        checkAuth();
    }, []);

    // Закрытие модального окна при клике вне его
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
        storage.clearAll(); // Очищаем всё: токен, пользователя, курсы
        setUser(null);
        setIsModalOpen(false);
        router.push('/workout/main'); // Перенаправляем на главную страницу
    };

    const handleProfile = () => {
        setIsModalOpen(false);
        // Переход на страницу профиля
        router.push('/profile');
    };

    const handleLogin = () => {
        // Сохраняем текущий курс для добавления после авторизации (если на странице курса)
        const pathParts = pathname?.split('/');
        if (pathParts && pathParts[1] === 'workout' && pathParts[2] === 'course' && pathParts[3]) {
            localStorage.setItem('pendingCourseId', pathParts[3]);
        }
        router.push('/workout/main');
    };

    // Показываем загрузку, если проверяем авторизацию
    if (isLoading) {
        return (
            <div className={styles['header-nav']}>
                <div className={styles['logo-area']}>
                    <div className={styles.logo}>
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
                <div className={styles['loading-placeholder']}></div>
            </div>
        );
    }

    // Если пользователь НЕ авторизован - показываем кнопку "Войти"
    if (!user) {
        return (
            <div className={styles['header-nav']}>
                <div className={styles['logo-area']}>
                    <div className={styles.logo}>
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
                    onClick={() => {
                        // Сохраняем текущий курс для добавления после авторизации (если на странице курса)
                        const pathParts = pathname?.split('/');
                        if (pathParts && pathParts[1] === 'workout' && pathParts[2] === 'course' && pathParts[3]) {
                            localStorage.setItem('pendingCourseId', pathParts[3]);
                        }
                        router.push('/workout/main');
                    }}
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
                <div className={styles.logo}>
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
                {/* ДОБАВЛЯЕМ onClick для открытия модального окна */}
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

                {/* Модальное окно */}
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