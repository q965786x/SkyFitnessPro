'use client';

import Header from '@/src/components/Header/Header';
import styles from './page.module.css';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

{/* const selectionTitles: Record<string, string> = {
    '1': 'Йога',
    '2': 'Стретчинг',
    '3': 'Фитнес',
    '4': 'Степ-аэробика',
    '5': 'Бодифлекс',
} */}

export default function CoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id; // реальный ID курса (1, 2, 3...)

    const handleGoToLesson = () => {
        router.push(`/workout/course/${courseId}/lesson/1`);
    };
    
    return (
        <div className={styles['main-container']} id="mainContainer">
            <div className={styles['page-content']}>
                {/* Используем компонент Header */}
                <Header />

                {/* Блок курса (1160px контент) */}
                <div className={styles['course-container']}>
                    {/* Фото курса: Йога (размер 1160х310) */}
                    <div className={styles['course-image-wrapper']}>
                        <Image
                            width={1160}
                            height={310}
                            className={styles['course-image']}
                            src="/img/yoga-course.png"
                            alt={'yoga'}
                        />                        
                    </div>                    

                    {/* Заголовок "Подойдет для вас, если:" */}
                    <div className={styles['section-label']}>Подойдет для вас, если:</div>

                    {/* Три блока в ряд с градиентом и цифрами 1,2,3" */}
                    <div className={styles['features-row']}>
                        {/* Блок 1 */}
                        <div className={styles['feature-card']}>
                            <div className={styles['feature-content']}>
                                <div className={styles['feature-number']}>1</div>
                                <div className={styles['feature-text']}>Давно хотели попробовать йогу, но не решались начать</div>
                            </div>
                        </div>
                        {/* Блок 2 */}
                        <div className={styles['feature-card']}>
                            <div className={styles['feature-content']}>
                                <div className={styles['feature-number']}>2</div>
                                <div className={styles['feature-text']}>Хотите укрепить позвоночник, избавиться от болей в спине и суставах</div>
                            </div>
                        </div>
                        {/* Блок 3 */}
                        <div className={styles['feature-card']}>
                            <div className={styles['feature-content']}>
                                <div className={styles['feature-number']}>3</div>
                                <div className={styles['feature-text']}>Ищете активность, полезную для тела и души</div>
                            </div>
                        </div>
                    </div>

                    {/* Блок "Направления" на всю ширину с фоном #BCEC30 */}
                    <div className={styles['directions-heading']}>Направления</div>
                    <div className={styles['directions-full-block']}>                        
                        <div className={styles['directions-grid']}>
                            <div className={styles['direction-item']}><span className={styles['star-icon']}></span> Йога для новичков</div>
                            <div className={styles['direction-item']}><span className={styles['star-icon']}></span> Классическая йога</div>
                            <div className={styles['direction-item']}><span className={styles['star-icon']}></span> Кундалини-йога</div>
                            <div className={styles['direction-item']}><span className={styles['star-icon']}></span> Йогатерапия</div>
                            <div className={styles['direction-item']}><span className={styles['star-icon']}></span> Хатха-йога</div>
                            <div className={styles['direction-item']}><span className={styles['star-icon']}></span> Аштанга-йога</div>
                        </div>
                    </div>

                    {/* Двойной блок: текст + фото справа */}                   
                    <div className={styles['double-panel']}>
                        <div className={styles['info-text-block']}>
                            <h4>Начните путь к новому телу</h4>
                            <ul className={styles['benefits-list']}>
                                <li>проработка всех групп мышц</li>
                                <li>тренировка суставов</li>
                                <li>улучшение циркуляции крови</li>
                                <li>упражнения заряжают бодростью</li>
                                <li>помогают противостоять стрессам</li>
                            </ul>
                            <button className={styles['btn-primary']}>Добавить курс</button>
                        </div>
                        <div className={styles['right-image']}>
                            <div className={styles['image-stack']}>
                                <Image
                                    src="/img/lines.png"
                                    alt="lines"
                                    fill
                                    className={styles['image-lines']}
                                />
                                
                                <Image
                                    src="/img/sportsman.png"
                                    alt="sportsman"
                                    fill
                                    className={styles['image-sportsman']}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}