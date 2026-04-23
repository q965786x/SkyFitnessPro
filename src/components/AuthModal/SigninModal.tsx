'use client';

import styles from './authModal.module.css';
import classNames from 'classnames';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/services/storage';
import { login, getMe, addCourseToUser } from '@/services/api';
import Modal from '../Modal/Modal';

type SigninModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess: () => void;
}

export default function SigninModal({ isOpen, onClose, onSwitchToSignup, onLoginSuccess }: SigninModalProps) {
    const router = useRouter();   
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
        
        try {
            const response = await login(loginEmail, password);
            storage.setToken(response.data.token);
            
            const userResponse = await getMe();
            const userData = userResponse.data;
            
            storage.setUser({
                name: userData.email.split('@')[0],
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
                        type="text"
                        name="login"
                        placeholder="Логин"
                        value={loginEmail}
                        onChange={onChangeLogin}
                        disabled={isLoading}
                    />
                    <input
                        className={classNames(styles.modal__input)}
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={onChangePassword}
                        disabled={isLoading}
                    />
                    {hasError && (
                        <div className={styles.errorContainer}>
                            {errorMessage}
                        </div>
                    )}
                    <button 
                        type="submit" 
                        className={styles.modal__btnEnter}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>
                    <button 
                        type="button"
                        className={styles.modal__btnSignup}
                        onClick={onSwitchToSignup}
                        disabled={isLoading}
                    >
                        Зарегистрироваться
                    </button>
                </form>
            </div>  
        </Modal>
    );
}