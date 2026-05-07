import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFoundPage() {
    return (
      <div className={styles.notFound}>
        <div className={styles.container}>
          <h1 className={styles.title}>404</h1>
          <h2 className={styles.subtitle}>Страница не найдена</h2>
          <p className={styles.description}>
            Возможно, она была удалена
            <br />
            или перенесена на другой адрес
          </p>
          <Link href="/workout/main" className={styles.homeLink}>
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
}