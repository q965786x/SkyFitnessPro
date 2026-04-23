import { NextResponse } from 'next/server';
import { loginUser } from '@/libs/fitness';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const token = await loginUser({ email, password });
    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 400 }
    );
  }
}