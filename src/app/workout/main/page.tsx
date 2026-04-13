import styles from './page.module.css';
import Image from 'next/image';

export default function MainPage() {
  return (
    <div className={styles['main-container']} id="mainContainer">
      <div className={styles['page-content']}>
        {/* Верхняя часть: логотип и кнопка "Выйти" */}
        <div className={styles['header-nav']}>
          <div className={styles['logo-area']}>
            <div className={styles.logo}>
              <Image 
                width={220}
                height={35}
                className={styles['logo__image']}
                src="/img/logo.png"
                alt={'logo'}
              />
            </div>
            <div className={styles['logo-subtitle']}>Онлайн-тренировки для занятий дома</div>
          </div>
          <button className={styles['logout-btn']} id="logoutBtn">Выйти</button>
        </div>

        {/* Блок с h1 и полем справа */}
        <div className={styles['title-section']}>
          <h1 className={styles['main-title']}>Начните заниматься спортом<br />и улучшите качество жизни</h1>
          <div className={styles['info-badge']}>
            <Image 
                width={288}
                height={120}
                className={styles['info-badge__image']}
                src="/img/badge.png"
                alt={'badge'}
              />
          </div>
        </div>

        {/* Сетка карточек: 5 штук, верх 3, низ 2 (flex-wrap c gap даст перенос на 2 строку) */}
        <div className={styles['cards']}>
          {/* 1. йОГА карточка */}
          <div className={styles.card}>
            <div className={styles['card-image-wrapper']}>
              <Image 
                width={360}
                height={325}
                className={styles['card-image']}
                src="/img/Yoga.png"
                alt={'yoga'}
              />
              <div className={styles['add-icon-wrapper']}>
                <Image 
                  width={32}
                  height={32}
                  className={styles['add-icon-image']}
                  src="/img/Add-icon.png"
                  alt={'add-icon'}
                />
              </div>
            </div>            
            <div className={styles['card-content']}>
              <div className={styles['card-title']}>Йога</div>
              <div className={styles['card-buttons-wrapper']}>
                <div className={styles['card-buttons-row']}>
                  <button className={styles['btn-calendar']}>
                    <Image 
                      width={18}
                      height={18}
                      className={styles['btn-icon']}
                      src="/img/calendar-icon.png"
                      alt={'calendar-icon'}                    
                    />
                    <span>25 дней</span>
                  </button>
                  <button className={styles['btn-time']}>
                    <Image 
                      width={18}
                      height={18}
                      className={styles['btn-icon']}
                      src="/img/time-icon.png"
                      alt={'time-icon'}
                    />
                    <span>20-50 мин/день</span>
                  </button>
                </div>
                <button className={styles['btn-difficulty']}>
                  <Image 
                    width={18}
                    height={18}
                    className={styles['btn-icon']}
                    src="/img/diagram-icon.png"
                    alt={'diagram-icon'}
                  />
                  <span>Сложность</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* 2. СТРЕТЧИНГ */}
          <div className={styles.card}>
            <div className={styles['card-image-wrapper']}>
              <Image 
                width={360}
                height={325}
                className={styles['card-image']}
                src="/img/Stretching.png"
                alt={'stretching'}
              />
              <div className={styles['add-icon-wrapper']}>
                <Image 
                  width={32}
                  height={32}
                  className={styles['add-icon-image']}
                  src="/img/Add-icon.png"
                  alt={'add-icon'}
                />
              </div>
            </div>
            <div className={styles['card-content']}>
              <div className={styles['card-title']}>Стретчинг</div>
              <div className={styles['card-buttons-wrapper']}>
                <div className={styles['card-buttons-row']}>
                  <button className={styles['btn-calendar']}>
                    <Image 
                      width={18}
                      height={18}
                      className={styles['btn-icon']}
                      src="/img/calendar-icon.png"
                      alt={'calendar-icon'}                    
                    />
                    <span>25 дней</span>
                  </button>
                  <button className={styles['btn-time']}>
                    <Image 
                      width={18}
                      height={18}
                      className={styles['btn-icon']}
                      src="/img/time-icon.png"
                      alt={'time-icon'}
                    />
                    <span>20-50 мин/день</span>
                  </button>
                </div>
                <button className={styles['btn-difficulty']}>
                  <Image 
                    width={18}
                    height={18}
                    className={styles['btn-icon']}
                    src="/img/diagram-icon.png"
                    alt={'diagram-icon'}
                  />
                  <span>Сложность</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* 3. ФИТНЕС */}
          <div className={styles.card}>
            <div className={styles['card-image-wrapper']}>
              <Image 
                width={360}
                height={325}
                className={styles['card-image']}
                src="/img/Fitness.png"
                alt={'fitness'}
              />
              <div className={styles['add-icon-wrapper']}>
                <Image 
                  width={32}
                  height={32}
                  className={styles['add-icon-image']}
                  src="/img/Add-icon.png"
                  alt={'add-icon'}
                />
              </div>
            </div>
            <div className={styles['card-content']}>
              <div className={styles['card-title']}>Фитнес</div>
              <div className={styles['card-buttons-wrapper']}>
                <div className={styles['card-buttons-row']}>
                  <button className={styles['btn-calendar']}>
                    <Image 
                      width={18}
                      height={18}
                      className={styles['btn-icon']}
                      src="/img/calendar-icon.png"
                      alt={'calendar-icon'}                    
                    />
                    <span>25 дней</span>
                  </button>
                  <button className={styles['btn-time']}>
                    <Image 
                      width={18}
                      height={18}
                      className={styles['btn-icon']}
                      src="/img/time-icon.png"
                      alt={'time-icon'}
                    />
                    <span>20-50 мин/день</span>
                  </button>
                </div>
                <button className={styles['btn-difficulty']}>
                  <Image 
                    width={18}
                    height={18}
                    className={styles['btn-icon']}
                    src="/img/diagram-icon.png"
                    alt={'diagram-icon'}
                  />
                  <span>Сложность</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* 4. СТЕП-АЭРОБИКА (вторая строка) */}
          <div className={styles.card}>
            <div className={styles['card-image-wrapper']}>
              <Image 
                width={360}
                height={325}
                className={styles['card-image']}
                src="/img/Step.png"
                alt={'step'}
              />
              <div className={styles['add-icon-wrapper']}>
                <Image 
                  width={32}
                  height={32}
                  className={styles['add-icon-image']}
                  src="/img/Add-icon.png"
                  alt={'add-icon'}
                />
              </div>
            </div>
            <div className={styles['card-content']}>
              <div className={styles['card-title']}>Степ-аэробика</div>
              <div className={styles['card-buttons-wrapper']}>
                <div className={styles['card-buttons-row']}>
                  <button className={styles['btn-calendar']}>
                    <Image 
                      width={18}
                      height={18}
                      className={styles['btn-icon']}
                      src="/img/calendar-icon.png"
                      alt={'calendar-icon'}                    
                    />
                    <span>25 дней</span>
                  </button>
                  <button className={styles['btn-time']}>
                    <Image 
                      width={18}
                      height={18}
                      className={styles['btn-icon']}
                      src="/img/time-icon.png"
                      alt={'time-icon'}
                    />
                    <span>20-50 мин/день</span>
                  </button>
                </div>
                <button className={styles['btn-difficulty']}>
                  <Image 
                    width={18}
                    height={18}
                    className={styles['btn-icon']}
                    src="/img/diagram-icon.png"
                    alt={'diagram-icon'}
                  />
                  <span>Сложность</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* 5. БОДИФЛЕКС */}
          <div className={styles.card}>
            <div className={styles['card-image-wrapper']}>
              <Image 
                width={360}
                height={325}
                className={styles['card-image']}
                src="/img/Bodyflex.png"
                alt={'bodyflex'}
              />
              <div className={styles['add-icon-wrapper']}>
                <Image 
                  width={32}
                  height={32}
                  className={styles['add-icon-image']}
                  src="/img/Add-icon.png"
                  alt={'add-icon'}
                />
              </div>
            </div>
            <div className={styles['card-content']}>
              <div className={styles['card-title']}>Бодифлекс</div>
              <div className={styles['card-buttons-wrapper']}>
                <div className={styles['card-buttons-row']}>
                  <button className={styles['btn-calendar']}>
                    <Image 
                      width={18}
                      height={18}
                      className={styles['btn-icon']}
                      src="/img/calendar-icon.png"
                      alt={'calendar-icon'}                    
                    />
                    <span>25 дней</span>
                  </button>
                  <button className={styles['btn-time']}>
                    <Image 
                      width={18}
                      height={18}
                      className={styles['btn-icon']}
                      src="/img/time-icon.png"
                      alt={'time-icon'}
                    />
                    <span>20-50 мин/день</span>
                  </button>
                </div>
                <button className={styles['btn-difficulty']}>
                  <Image 
                    width={18}
                    height={18}
                    className={styles['btn-icon']}
                    src="/img/diagram-icon.png"
                    alt={'diagram-icon'}
                  />
                  <span>Сложность</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка "Вверх" по центру сбоку от текста стрелочка (как на скрине) */}
        <div className={styles['footer-btn']}>
          <button className={styles['scroll-to-top']} id="scrollUpBtn">
            <span>Вверх</span>
            <span className={styles['arrow-up']}>↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}