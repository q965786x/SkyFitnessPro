'use client';

import styles from './authModal.module.css';
import classNames from 'classnames';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/services/storage';
import Modal from '../Modal/Modal';
import { 
    getMe, 
    loginUser, 
    registerUser 
} from '@/services/auth/authApi';
import { addCourseToUser } from '@/services/courses/coursesApi';
import { useToast } from '@/hooks/useToast';

type SignupModalProps = {
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
    };    

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
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
                        disabled={isLoading}
                    />
                    <input
                        className={styles.modal__input}
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Пароль"
                        value={password}
                        onChange={onChangePassword}
                        disabled={isLoading}
                    />
                    <input
                        className={styles.modal__input}
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        placeholder="Повторите пароль"
                        value={confirmPassword}
                        onChange={onChangeConfirmPassword}
                        disabled={isLoading}
                    />
                    {hasError && (
                        <div className={styles.errorContainer}>
                            {errorMessage}
                        </div>
                    )}
                    <button 
                        type="submit" 
                        className={styles.modal__btnSignupEnt}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                    <button 
                        type="button"
                        className={styles.modal__btnEnter}
                        onClick={onSwitchToSignin}
                        disabled={isLoading}
                    >
                        Войти
                    </button>
                </form>
            </div>  
        </Modal>
    );
}