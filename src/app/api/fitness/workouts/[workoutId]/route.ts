import { NextResponse } from 'next/server';
import { getWorkoutById, verifyToken } from '@/libs/fitness';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  const { workoutId } = await params;
  console.log('=== WORKOUT API CALLED for ID:', workoutId);

  try {
    const auth = request.headers.get('authorization');
    console.log('Authorization header:', auth);

    if (!auth) {
      console.log('No authorization header');
      return NextResponse.json(
        { message: 'Отсутствует Authorization токен' },
        { status: 401 }
      );
    }

    const token = auth?.split(' ')[1];
    console.log('Token extracted:', token ? 'Yes' : 'No');

    if (!token) {
      return NextResponse.json(
        { message: 'Невалидный формат токена' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);

    if (!decoded) {
      return NextResponse.json(
        { message: 'Невалидный токен' },
        { status: 401 }
      );
    }

    const workout = await getWorkoutById(workoutId);
    console.log('Workout found:', workout);
    
    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error getting workout:', error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 404 }
    );
  }
}