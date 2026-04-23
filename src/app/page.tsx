import { redirect } from 'next/navigation';

export default function RootPage() {
  // Перенаправляем на страницу main для всех пользователей
  redirect('/workout/main');
}