import { db } from '@/db';
import { issues } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const issues = await db.query.issues.findMany({});
    return NextResponse.json({ data: { issues } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'nah' }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const [newIssue] = await db
      .insert(issues)
      .values(await req.json())
      .returning();

    return NextResponse.json({ data: newIssue });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'nah' }, { status: 500 });
  }
};
