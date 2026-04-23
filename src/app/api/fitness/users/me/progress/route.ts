import { NextResponse } from 'next/server';
import { verifyToken, getWorkoutProgress, getAllWorkoutsProgress } from '@/libs/fitness';

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');
    const workoutId = url.searchParams.get('workoutId');

    if (!courseId) {
      return NextResponse.json(
        { message: 'ID курса должен быть указан' },
        { status: 400 }
      );
    }

    const progress = workoutId
      ? await getWorkoutProgress(decoded.id, courseId, workoutId)
      : await getAllWorkoutsProgress(decoded.id, courseId);
      
    return NextResponse.json(progress);
  } catch (err) {
    console.error('Error getting progress:', err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}