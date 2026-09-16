import { db } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      with: { user: true, sources: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: event });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
};
