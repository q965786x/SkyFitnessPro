import { NextResponse } from 'next/server';
import { verifyToken, markWorkoutProgress } from '@/libs/fitness';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string; workoutId: string }> }
) {
  const { courseId, workoutId } = await params;

  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Отсутствует Authorization токен' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Невалидный токен' },
        { status: 401 }
      );
    }

    const { progressData } = await request.json();
    
    if (!progressData) {
      return NextResponse.json(
        { message: 'Тело запроса должно содержать progressData' },
        { status: 400 }
      );
    }

    await markWorkoutProgress(decoded.id, courseId, workoutId, progressData);
    return NextResponse.json({ message: 'Прогресс по данной тренировке отмечен!' });
  } catch (err) {
    console.error('Error marking workout progress:', err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}