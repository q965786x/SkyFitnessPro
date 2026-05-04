'use client';

import styles from './authModal.module.css';
import classNames from 'classnames';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/utils/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addCourse } from '@/store/slices/coursesSlice';
import { closeAuthModals, openSignupModal } from '@/store/slices/uiSlice';
import { clearError, login } from '@/store/slices/authSlice';
import Modal from '../Modal/Modal';
import { store } from '@/store';

// import { storage } from '@/services/storage';

// import Modal from '../Modal/Modal';
// import { getMe, loginUser } from '@/services/auth/authApi';
// import { addCourseToUser } from '@/services/courses/coursesApi';

{/* type SigninModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess: () => void;
}

export default function SigninModal({ isOpen, onClose, onSwitchToSignup, onLoginSuccess }: SigninModalProps) {
    const router = useRouter();  
    const { showSuccess, showError, showLoading, dismiss } = useToast(); 
    const [hasError, setHasError] = useState(false); 
    const [loginEmail, setLoginEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const onChangeLogin = (e: ChangeEvent<HTMLInputElement>) => {
        setLoginEmail(e.target.value);
        setErrorMessage('');
    };

    const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setErrorMessage('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setHasError(false);
        setErrorMessage('');

        if (!emailRegex.test(loginEmail)) {
            setHasError(true);
            setErrorMessage('Введите корректный email');
            setIsLoading(false);
            return;
        }

        if (!loginEmail.trim() || !password.trim()) {
            setHasError(true);
            setErrorMessage('Заполните все поля');
            setIsLoading(false);
            return;
        }

        const loadingToast = showLoading('Вход...');
        
        try {
            // 1. Логинимся, получаем токен
            const response = await loginUser({ email: loginEmail, password });
            const token = response.data.token;
            storage.setToken(token);
            
            // 2. Получаем данные пользователя
            const userResponse = await getMe();
            const userData = userResponse.data;

            console.log('User data after getMe:', userData);

            // Проверяем, что userData существует
            if (!userData || !userData.email) {
                throw new Error('Не удалось получить данные пользователя');
            }
            
            // 3. Сохраняем пользователя
            storage.setUser({
                name: userData.email.split('@')[0],
                email: userData.email,
            });
            
            // 4. Получаем курсы пользователя
            const userCoursesIds = userData.selectedCourses || [];
            storage.setUserCoursesIds(userCoursesIds);
            
            // 5. Проверяем отложенный курс
            const pendingCourseId = localStorage.getItem('pendingCourseId');
            if (pendingCourseId && pendingCourseId !== 'null') {
                localStorage.removeItem('pendingCourseId');
                
                if (!userCoursesIds.includes(pendingCourseId)) {
                    try {
                        await addCourseToUser(pendingCourseId);
                        const updatedCourses = [...userCoursesIds, pendingCourseId];
                        storage.setUserCoursesIds(updatedCourses);
                        showSuccess('Курс успешно добавлен!');
                    } catch (addError) {
                        console.error('Ошибка добавления курса:', addError);
                    }
                }
            }

            // Успешный вход
            dismiss(loadingToast);
            showSuccess('Вход выполнен успешно!');

            // Вызываем callback для обновления состояния авторизации
            onLoginSuccess();            
            onClose();
            router.refresh();
        } catch (err) {
            console.error('Login error:', err);
            setHasError(true);

            // Обрабатываем ошибки от сервера
            const error = err as { response?: { status?: number; data?: { message?: string } } };
            
            let errorMsg = '';
            
            if (error.response?.status === 404) {
                errorMsg = error.response?.data?.message || 'Пользователь не найден';
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (err instanceof Error) {
                errorMsg = err.message;
            } else {
                errorMsg = 'Ошибка входа. Проверьте email и пароль';
            }

            setErrorMessage(errorMsg);
            dismiss(loadingToast);
            showError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }; */}

type SigninModalProps = {
  onLoginSuccess: () => void;
}

export default function SigninModal({ onLoginSuccess }: SigninModalProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { showSuccess, showError, showLoading, showInfo, dismiss } = useToast();
    
    const { isLoading: isAuthLoading, error: authError } = useAppSelector((state) => state.auth);
    const isOpen = useAppSelector((state) => state.ui.isSigninModalOpen);
    
    const [loginEmail, setLoginEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const onChangeLogin = (e: ChangeEvent<HTMLInputElement>) => {
        setLoginEmail(e.target.value);
        setErrorMessage('');
        setHasError(false);
        if (authError) {
            dispatch(clearError());
        }
    };

    const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setErrorMessage('');
        setHasError(false);
        if (authError) {
            dispatch(clearError());
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setHasError(false);
        setErrorMessage('');

        if (!emailRegex.test(loginEmail)) {
            setHasError(true);
            setErrorMessage('Введите корректный email');
            return;
        }

        if (!loginEmail.trim() || !password.trim()) {
            setHasError(true);
            setErrorMessage('Заполните все поля');
            return;
        }

        const loadingToast = showLoading('Вход...');
        
        try {
            const result = await dispatch(login({ email: loginEmail, password })).unwrap();
            dismiss(loadingToast);
            
            if (result) {
                showSuccess('Вход выполнен успешно!');
                
                // Проверяем отложенный курс
                const pendingCourseId = localStorage.getItem('pendingCourseId');
                if (pendingCourseId && pendingCourseId !== 'null') {
                    localStorage.removeItem('pendingCourseId');
                    
                    // ДОБАВЛЯЕМ ПРОВЕРКУ: добавлен ли уже курс
                    const { userCoursesIds } = store.getState().courses;
                    
                    if (!userCoursesIds.includes(pendingCourseId)) {
                        await dispatch(addCourse(pendingCourseId)).unwrap();
                        showSuccess('Курс успешно добавлен!');
                    } else {
                        // Курс уже добавлен, просто показываем уведомление
                        showInfo('Этот курс уже добавлен в ваш профиль');
                    }
                }
                
                
                onLoginSuccess();
                dispatch(closeAuthModals());
                router.refresh();
            }
        } catch {
            dismiss(loadingToast);
            setHasError(true);
            setErrorMessage(authError || 'Ошибка входа. Проверьте email и пароль');
            showError(authError || 'Ошибка входа. Проверьте email и пароль');
        }
    };


    const handleClose = () => {
        dispatch(closeAuthModals());
        setLoginEmail('');
        setPassword('');
        setHasError(false);
        setErrorMessage('');
        dispatch(clearError());
    };

    const handleSwitchToSignup = () => {
        dispatch(closeAuthModals());
        dispatch(openSignupModal());
        setLoginEmail('');
        setPassword('');
        setHasError(false);
        setErrorMessage('');
        dispatch(clearError());
    };

    if (!isOpen) return null;

        
    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className={hasError ? styles.modal__blockWithError : styles.modal__block}>
                <form className={styles.modal__form} onSubmit={handleSubmit}>
                    <div className={styles.modal__logo}>
                        <Image 
                            width={220}
                            height={35}
                            className={styles['logo__image']}
                            src="/img/logo.png"
                            alt={'logo'}
                        />
                    </div>
                    <input
                        className={classNames(styles.modal__input, styles.login)}
                        type="text"
                        name="login"
                        autoComplete="email"
                        placeholder="Логин"
                        value={loginEmail}
                        onChange={onChangeLogin}
                        disabled={isAuthLoading}
                    />
                    <input
                        className={classNames(styles.modal__input)}
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Пароль"
                        value={password}
                        onChange={onChangePassword}
                        disabled={isAuthLoading}
                    />
                    {(hasError || authError) && (
                        <div className={styles.errorContainer}>
                            {errorMessage || authError}
                        </div>
                    )}
                    <button 
                        type="submit" 
                        className={styles.modal__btnEnter}
                        disabled={isAuthLoading}
                    >
                        {isAuthLoading ? 'Вход...' : 'Войти'}
                    </button>
                    <button 
                        type="button"
                        className={styles.modal__btnSignup}
                        onClick={handleSwitchToSignup}
                        disabled={isAuthLoading}
                    >
                        Зарегистрироваться
                    </button>
                </form>
            </div>  
        </Modal>
    );
}