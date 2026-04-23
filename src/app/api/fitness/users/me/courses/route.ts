import { NextResponse } from 'next/server';
import { addCourseToUser, verifyToken } from '@/libs/fitness';

export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization');
    console.log('Authorization header:', auth);

    if (!auth) {
      return NextResponse.json(
        { message: 'Отсутствует Authorization токен' },
        { status: 401 }
      );
    }

    const token = auth?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message:'Невалидный формат токена' },
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

    const { courseId } = await request.json();
    
    if (!courseId) {
      return NextResponse.json(
        { message: 'ID курса должен быть указан' },
        { status: 400 }
      );
    }

    await addCourseToUser(decoded.id, courseId);
    return NextResponse.json({ message: 'Курс успешно добавлен!' });
  } catch (err) {
    console.error('Error adding course:', err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}