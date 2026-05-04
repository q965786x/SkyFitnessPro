'use client';

import styles from './authModal.module.css';
import classNames from 'classnames';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../Modal/Modal';
import { useToast } from '@/utils/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addCourse } from '@/store/slices/coursesSlice';
import { closeAuthModals, openSigninModal } from '@/store/slices/uiSlice';
import { register, clearError } from '@/store/slices/authSlice';
import { store } from '@/store';

// import { storage } from '@/services/storage';
// import { getMe, loginUser, registerUser } from '@/services/auth/authApi';
// import { addCourseToUser } from '@/services/courses/coursesApi';

{/* type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignin: () => void;
  onLoginSuccess: () => void;
}

export default function SignupModal({ isOpen, onClose, onSwitchToSignin, onLoginSuccess }: SignupModalProps) {
    const router = useRouter();
    const { showSuccess, showError, showLoading, dismiss } = useToast();
    const [hasError, setHasError] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const onChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setErrorMessage('');
    };

    const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setErrorMessage('');
    };

    const onChangeConfirmPassword = (e: ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        setErrorMessage('');
    };

    const validatePassword = (password: string): string | null => {
        if (password.length < 6) {
            return 'Пароль должен содержать не менее 6 символов';
        }
        
        const specialChars = password.match(/[!@#$%^&*(),.?":{}|<>]/g);
        if (!specialChars || specialChars.length < 2) {
            return 'Пароль должен содержать не менее 2 спецсимволов';
        }
        
        if (!/[A-Z]/.test(password)) {
            return 'Пароль должен содержать как минимум одну заглавную букву';
        }
        
        return null;
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setHasError(false);
        setErrorMessage('');

        // Базовая валидация на клиенте
        if (!emailRegex.test(email)) {
            setHasError(true);
            setErrorMessage('Введите корректный email');
            setIsLoading(false);
            return;
        }

        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            setHasError(true);
            setErrorMessage('Заполните все поля');
            setIsLoading(false);
            return;
        } 
        
        if (password.trim() !== confirmPassword.trim()) {
            setHasError(true);
            setErrorMessage('Пароли не совпадают');
            setIsLoading(false);
            return;
        } 

        const passwordError = validatePassword(password);
        if (passwordError) {
            setHasError(true);
            setErrorMessage(passwordError);
            setIsLoading(false);
            return;
        }

        const loadingToast = showLoading('Регистрация...');
        
        try {
            // Регистрация
            await registerUser({ email, password });
            
            // Автоматический вход после регистрации
            const loginResponse = await loginUser({ email, password });
            const token = loginResponse.data.token;
            storage.setToken(token);
            
            const userResponse = await getMe();
            const userData = userResponse.data;

            storage.setUser({
                name: email.split('@')[0],
                email: userData.email,
            });
            
            // Безопасная проверка selectedCourses
            const userCoursesIds = userData.selectedCourses || [];
            storage.setUserCoursesIds(userCoursesIds);
            
            // Проверяем, есть ли курс для добавления
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

            dismiss(loadingToast);
            showSuccess('Регистрация прошла успешно!');

            // Вызываем callback для обновления состояния авторизации
            onLoginSuccess();            
            onClose();
            router.refresh();
        } catch (err) {
            dismiss(loadingToast);
            console.error('Registration error:', err);
            setHasError(true);

            // Обрабатываем ошибки от сервера
            const error = err as { response?: { status?: number; data?: { message?: string } } };
            let message = 'Ошибка регистрации. Попробуйте позже';

            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.response?.status === 400) {
                message = 'Пользователь с таким email уже существует или данные неверны';
            }

            setErrorMessage(message);
            showError(message);
        } finally {
            setIsLoading(false);
        }
    }; */}   

type SignupModalProps = {
  onLoginSuccess: () => void;
}

export default function SignupModal({ onLoginSuccess }: SignupModalProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { showSuccess, showError, showLoading, showInfo, dismiss } = useToast();
    
    const { isLoading: isAuthLoading, error: authError } = useAppSelector((state) => state.auth);
    const isOpen = useAppSelector((state) => state.ui.isSignupModalOpen);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const onChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
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

    const onChangeConfirmPassword = (e: ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        setErrorMessage('');
        setHasError(false);
        if (authError) {
            dispatch(clearError());
        }
    };

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 6) {
            return 'Пароль должен содержать не менее 6 символов';
        }
        
        const specialChars = pwd.match(/[!@#$%^&*(),.?":{}|<>]/g);
        if (!specialChars || specialChars.length < 2) {
            return 'Пароль должен содержать не менее 2 спецсимволов';
        }
        
        if (!/[A-Z]/.test(pwd)) {
            return 'Пароль должен содержать как минимум одну заглавную букву';
        }
        
        return null;
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setHasError(false);
        setErrorMessage('');

        if (!emailRegex.test(email)) {
            setHasError(true);
            setErrorMessage('Введите корректный email');
            return;
        }

        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            setHasError(true);
            setErrorMessage('Заполните все поля');
            return;
        } 
        
        if (password.trim() !== confirmPassword.trim()) {
            setHasError(true);
            setErrorMessage('Пароли не совпадают');
            return;
        } 

        const passwordError = validatePassword(password);
        if (passwordError) {
            setHasError(true);
            setErrorMessage(passwordError);
            return;
        }

        const loadingToast = showLoading('Регистрация...');
        
        try {
            const result = await dispatch(register({ email, password })).unwrap();
            dismiss(loadingToast);
            
            if (result) {
                showSuccess('Регистрация прошла успешно!');
                
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
            setErrorMessage(authError || 'Ошибка регистрации. Попробуйте позже');
            showError(authError || 'Ошибка регистрации. Попробуйте позже');
        }
    };


    const handleClose = () => {
        dispatch(closeAuthModals());
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setHasError(false);
        setErrorMessage('');
        dispatch(clearError());
    };

    const handleSwitchToSignin = () => {
        dispatch(closeAuthModals());
        dispatch(openSigninModal());
        setEmail('');
        setPassword('');
        setConfirmPassword('');
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
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="Эл.почта"
                        value={email}
                        onChange={onChangeEmail}
                        disabled={isAuthLoading}
                    />
                    <input
                        className={styles.modal__input}
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Пароль"
                        value={password}
                        onChange={onChangePassword}
                        disabled={isAuthLoading}
                    />
                    <input
                        className={styles.modal__input}
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        placeholder="Повторите пароль"
                        value={confirmPassword}
                        onChange={onChangeConfirmPassword}
                        disabled={isAuthLoading}
                    />
                    {(hasError || authError) && (
                        <div className={styles.errorContainer}>
                            {errorMessage || authError}
                        </div>
                    )}
                    <button 
                        type="submit" 
                        className={styles.modal__btnSignupEnt}
                        disabled={isAuthLoading}
                    >
                        {isAuthLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                    <button 
                        type="button"
                        className={styles.modal__btnEnter}
                        onClick={handleSwitchToSignin}
                        disabled={isAuthLoading}
                    >
                        Войти
                    </button>
                </form>
            </div>  
        </Modal>
    );
}