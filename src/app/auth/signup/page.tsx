'use client';

import styles from './signup.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function SignUp() {
    const [hasError, setHasError] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !password || !confirmPassword) {
            setHasError(true);
            setErrorMessage('Заполните все поля');
        } else if (password !== confirmPassword) {
            setHasError(true);
            setErrorMessage('Пароли не совпадают');
        } else {
            setHasError(false);
            setErrorMessage('');
            // Здесь логика регистрации
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
                        type="email"
                        name="email"
                        placeholder="Эл.почта"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className={styles.modal__input}
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        className={styles.modal__input}
                        type="password"
                        name="confirmPassword"
                        placeholder="Повторите пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {hasError && (
                        <div className={styles.errorContainer}>
                            {errorMessage}
                        </div>
                    )}
                    <button type="submit" className={styles.modal__btnSignupEnt}>
                        Зарегистрироваться
                    </button>
                    <Link href={'/auth/signin'} className={styles.modal__btnEnter}>
                        Войти
                    </Link>
                </form>
            </div>                
        </>
    );
}