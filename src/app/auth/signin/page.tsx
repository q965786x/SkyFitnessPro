'use client';

import styles from './signin.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Signin() {
    const [hasError, setHasError] = useState(false);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Пример валидации
        if (!login || !password) {
            setHasError(true);
            setErrorMessage('Заполните все поля');
        } else {
            setHasError(false);
            setErrorMessage('');
            // Здесь логика авторизации
        }
    };

    return (
        <>
            <div className={hasError ? styles.modal__blockWithError : styles.modal__block}>
                <form className={styles.modal__form} onSubmit={handleSubmit}>
                    <Link href="/workout/main">
                        <div className={styles.modal__logo}>
                            <Image 
                                width={220}
                                height={35}
                                className={styles['logo__image']}
                                src="/img/logo.png"
                                alt={'logo'}
                            />
                        </div>
                    </Link>
                    <input
                        className={classNames(styles.modal__input, styles.login)}
                        type="text"
                        name="login"
                        placeholder="Логин"
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <input
                        className={classNames(styles.modal__input)}
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {hasError && (
                        <div className={styles.errorContainer}>
                            {errorMessage}
                        </div>
                    )}
                    <button type="submit" className={styles.modal__btnEnter}>Войти</button>
                    <Link href={'/auth/signup'} className={styles.modal__btnSignup}>
                        Зарегистрироваться
                    </Link>
                </form>
            </div>                
        </>
    );
}