/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Включаем статический экспорт
  images: {
    unoptimized: true, // Отключаем оптимизацию изображений Next.js
  },
}
module.exports = nextConfig