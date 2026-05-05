'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './skeleton.module.css';

export default function CoursesGridSkeleton() {
  return (
    <div className={styles.coursesGridSkeleton}>
      {Array(6).fill(null).map((_, index) => (
        <div key={index} className={styles.cardSkeleton}>
          <div className={styles.cardImageSkeleton}>
            <Skeleton height={325} width="100%" />
          </div>
          <div className={styles.cardContentSkeleton}>
            <Skeleton height={32} width="70%" style={{ marginBottom: '12px' }} />
            <div className={styles.cardButtonsSkeleton}>
              <Skeleton height={40} width="45%" borderRadius="50px" />
              <Skeleton height={40} width="45%" borderRadius="50px" />
            </div>
            <Skeleton height={40} width="100%" borderRadius="46px" style={{ marginTop: '12px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}