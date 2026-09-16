import { db } from '@/db';
import { events } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const result = await db.query.events.findMany({
      orderBy: (e, { desc }) => [desc(e.createdAt)],
    });
    return NextResponse.json({ data: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const [newEvent] = await db
      .insert(events)
      .values(await req.json())
      .returning();

    return NextResponse.json({ data: newEvent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
};
