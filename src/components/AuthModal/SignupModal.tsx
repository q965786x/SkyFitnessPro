'use client';

import styles from './authModal.module.css';
import classNames from 'classnames';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/services/storage';
import { register, login, getMe, addCourseToUser } from '@/services/api';
import Modal from '../Modal/Modal';

type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignin: () => void;
  onLoginSuccess: () => void;
}

export default function SignupModal({ isOpen, onClose, onSwitchToSignin, onLoginSuccess }: SignupModalProps) {
    const router = useRouter();
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
        
        try {
            await register(email, password);
            
            const loginResponse = await login(email, password);
            storage.setToken(loginResponse.data.token);
            
            const userResponse = await getMe();
            const userData = userResponse.data;

            storage.setUser({
                name: email.split('@')[0],
                email: userData.email,
            });
            
            storage.setUserCoursesIds(userData.selectedCourses);
            
            const pendingCourseId = localStorage.getItem('pendingCourseId');
            if (pendingCourseId) {
                localStorage.removeItem('pendingCourseId');
                
                if (!userData.selectedCourses.includes(pendingCourseId)) {
                    try {
                        await addCourseToUser(pendingCourseId);
                        const updatedCourses = [...userData.selectedCourses, pendingCourseId];
                        storage.setUserCoursesIds(updatedCourses);
                    } catch (addError) {
                        console.error('Ошибка добавления курса:', addError);
                    }
                }
            }

            // Вызываем callback для обновления состояния авторизации
            onLoginSuccess();
            
            onClose();
            router.refresh();
        } catch (err) {
            const error = err as Error;
            setHasError(true);
            setErrorMessage(error.message);
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
                        placeholder="Эл.почта"
                        value={email}
                        onChange={onChangeEmail}
                        disabled={isLoading}
                    />
                    <input
                        className={styles.modal__input}
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={onChangePassword}
                        disabled={isLoading}
                    />
                    <input
                        className={styles.modal__input}
                        type="password"
                        name="confirmPassword"
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