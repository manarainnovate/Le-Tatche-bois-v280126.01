import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(null, { status: 401 });
    }

    const theme = await prisma.adminThemePreference.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(theme || null);
  } catch (error) {
    console.error('Theme GET error:', error);
    return NextResponse.json(null);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const theme = await prisma.adminThemePreference.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data,
      },
      update: data,
    });

    return NextResponse.json(theme);
  } catch (error) {
    console.error('Theme PUT error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
