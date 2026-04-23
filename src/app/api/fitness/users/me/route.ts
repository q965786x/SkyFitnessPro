import { NextResponse } from 'next/server';
import { getUserByToken } from '@/libs/fitness';

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

    const user = await getUserByToken(token);

    return NextResponse.json({
      email: user.email,
      selectedCourses: user.selectedCourses
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 400 }
    );
  }
}