import { NextResponse } from 'next/server';
import { registerUser } from '@/libs/fitness';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    await registerUser({ email, password });
    return NextResponse.json(
      { message: 'Регистрация прошла успешно!' },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 400 }
    );
  }
}
