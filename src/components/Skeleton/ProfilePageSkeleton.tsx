'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './skeleton.module.css';

export default function ProfilePageSkeleton() {
  return (
    <div className={styles.profilePageSkeleton}>
      <div className={styles.headerSkeleton}>
        <Skeleton height={40} width={200} />
        <div className={styles.userInfoSkeleton}>
          <Skeleton circle height={50} width={50} />
          <Skeleton height={24} width={100} />
        </div>
      </div>

      <div className={styles.profileCardSkeleton}>
        <Skeleton circle height={197} width={197} />
        <div className={styles.profileInfoSkeleton}>
          <Skeleton height={32} width={200} style={{ marginBottom: '12px' }} />
          <Skeleton height={18} width={250} style={{ marginBottom: '30px' }} />
          <Skeleton height={52} width={192} borderRadius="46px" />
        </div>
      </div>

      <Skeleton height={40} width={250} style={{ marginBottom: '30px' }} />

      <div className={styles.coursesGridSkeleton}>
        {Array(3).fill(null).map((_, index) => (
          <div key={index} className={styles.profileCourseCardSkeleton}>
            <Skeleton height={325} width="100%" />
            <div style={{ padding: '20px' }}>
              <Skeleton height={32} width="70%" style={{ marginBottom: '12px' }} />
              <Skeleton height={8} width="100%" style={{ marginTop: '12px' }} />
              <Skeleton height={52} width="100%" borderRadius="46px" style={{ marginTop: '20px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}