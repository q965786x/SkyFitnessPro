'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './skeleton.module.css';

export default function LessonPageSkeleton() {
  return (
    <div className={styles.lessonPageSkeleton}>
      <div className={styles.headerSkeleton}>
        <Skeleton height={40} width={200} />
        <div className={styles.userInfoSkeleton}>
          <Skeleton circle height={50} width={50} />
          <Skeleton height={24} width={100} />
        </div>
      </div>

      <Skeleton height={60} width="50%" style={{ marginBottom: '40px' }} />

      <div className={styles.videoSkeleton}>
        <Skeleton height={550} width="100%" borderRadius={30} />
      </div>

      <Skeleton height={32} width={250} style={{ marginBottom: '20px' }} />

      <div className={styles.exercisesListSkeleton}>
        {Array(5).fill(null).map((_, index) => (
          <div key={index} className={styles.exerciseItemSkeleton}>
            <Skeleton height={24} width="60%" />
            <Skeleton height={8} width="100%" style={{ marginTop: '12px' }} />
            <Skeleton height={20} width="30%" style={{ marginTop: '12px' }} />
          </div>
        ))}
      </div>

      <Skeleton height={52} width={320} borderRadius="46px" />
    </div>
  );
}