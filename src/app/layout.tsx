import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/components/ReduxProvider/ReduxProvider';
import ToastProvider from '@/components/ToastProvider/ToastProvider';


const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SkyFitnessPro - Онлайн-тренировки для занятий дома',
  description: 'Онлайн-тренировки для занятий дома. Достигайте своих фитнес-целей с профессиональными программами.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">     
      <body className={`${roboto.variable}`}>
        <ReduxProvider>
          {children}
          <ToastProvider />
        </ReduxProvider>    
      </body>
    </html>
  );
}
