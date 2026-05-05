'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './skeleton.module.css';

export default function CoursePageSkeleton() {
  return (
    <div className={styles.coursePageSkeleton}>
      <div className={styles.headerSkeleton}>
        <Skeleton height={40} width={200} />
        <div className={styles.userInfoSkeleton}>
          <Skeleton circle height={50} width={50} />
          <Skeleton height={24} width={100} />
        </div>
      </div>

      <div className={styles.bannerSkeleton}>
        <Skeleton height={310} width="100%" borderRadius={30} />
      </div>

      <Skeleton height={40} width={300} style={{ marginBottom: '24px' }} />

      <div className={styles.featuresGridSkeleton}>
        {Array(3).fill(null).map((_, index) => (
          <div key={index} className={styles.featureCardSkeleton}>
            <Skeleton height={75} width={75} />
            <div className={styles.featureTextSkeleton}>
              <Skeleton height={24} width="100%" />
              <Skeleton height={24} width="80%" style={{ marginTop: '8px' }} />
            </div>
          </div>
        ))}
      </div>

      <Skeleton height={40} width={250} style={{ marginBottom: '24px' }} />

      <div className={styles.directionsSkeleton}>
        {Array(6).fill(null).map((_, index) => (
          <Skeleton key={index} height={40} width={200} borderRadius="8px" />
        ))}
      </div>
    </div>
  );
}