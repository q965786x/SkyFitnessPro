import { NextResponse } from 'next/server';
import { verifyToken, deleteCourseFromUser } from '@/libs/fitness';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

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

    await deleteCourseFromUser(decoded.id, courseId);
    return NextResponse.json({ message: 'Курс успешно удален!' });
  } catch (err) {
    console.error('Error deleting course:', err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}