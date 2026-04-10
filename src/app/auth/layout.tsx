import { ReactNode } from 'react';
import styles from './layout.module.css';

type AuthLayoutProps = {
    children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {

    return (
        <>
            <div className={styles.wrapper}>
                <div className={styles.containerEnter}>
                    {children}
                </div>
            </div>
        </>
    );
}