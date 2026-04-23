import { NextResponse } from 'next/server';
import { getCourseById } from '@/libs/fitness';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  console.log('=== COURSE DETAIL API CALLED for ID:', courseId);

  try {
    const course = await getCourseById(courseId);
    console.log('Course found:', course);
    return NextResponse.json(course);
  } catch (error) {
    console.error('Error in course detail API:', error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 404 }
    );
  }
}