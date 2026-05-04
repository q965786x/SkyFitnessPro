'use client';

import Image from 'next/image';
import { useState } from 'react';

type CourseImageProps = {
  nameEN: string;
  nameRU: string;
  type?: 'card' | 'banner';
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

const imageMap: Record<string, { card: string; banner: string }> = {
  'Yoga': { card: '/img/Yoga.png', banner: '/img/Yoga-course.png' },
  'Stretching': { card: '/img/Stretching.png', banner: '/img/Stretching-course.png' },
  'Fitness': { card: '/img/Fitness.png', banner: '/img/Fitness-course.png' },
  'StepAerobics': { card: '/img/Step.png', banner: '/img/Step-course.png' },
  'Bodyflex': { card: '/img/Bodyflex.png', banner: '/img/Bodyflex-course.png' },
  'Йога': { card: '/img/Yoga.png', banner: '/img/Yoga-course.png' },
  'Стретчинг': { card: '/img/Stretching.png', banner: '/img/Stretching-course.png' },
  'Фитнес': { card: '/img/Fitness.png', banner: '/img/Fitness-course.png' },
  'Степ-аэробика': { card: '/img/Step.png', banner: '/img/Step-course.png' },
  'Бодифлекс': { card: '/img/Bodyflex.png', banner: '/img/Bodyflex-course.png' },
};

export default function CourseImage({ 
  nameEN, 
  nameRU, 
  type = 'card', 
  width, 
  height, 
  className, 
  priority = false 
}: CourseImageProps) {
  const [imgError, setImgError] = useState(false);  
  
  const imagePath = imageMap[nameEN]?.[type] || imageMap[nameRU]?.[type];  
  
  if (!imagePath || imgError) {
    return (
      <div 
        className={className} 
        style={{ 
          width, 
          height, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }}
      >
        {nameRU.substring(0, 2)}
      </div>
    );
  }
  
  return (
    <Image
      width={width}
      height={height}
      className={className}
      src={imagePath}
      alt={nameRU}
      priority={priority}
      onError={() => setImgError(true)}
    />
  );
}