import { NextResponse } from 'next/server';
import { verifyToken, restartWorkoutForUser } from '@/libs/fitness';

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string; workoutId: string } }
) {
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

    await restartWorkoutForUser(decoded.id, params.courseId, params.workoutId);
    return NextResponse.json({ message: 'Прогресс тренировки удалён!' });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}