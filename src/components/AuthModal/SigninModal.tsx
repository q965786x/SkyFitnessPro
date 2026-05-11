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
                
                const pendingCourseId = localStorage.getItem('pendingCourseId');
                if (pendingCourseId && pendingCourseId !== 'null') {
                    localStorage.removeItem('pendingCourseId');                    
                    
                    const { userCoursesIds } = store.getState().courses;
                    
                    if (!userCoursesIds.includes(pendingCourseId)) {
                        await dispatch(addCourse(pendingCourseId)).unwrap();
                        showSuccess('Курс успешно добавлен!');
                    } else {                        
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
            const errorText = authError || 'Ошибка входа. Проверьте email и пароль';
            setErrorMessage(errorText);
            showError(errorText);
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