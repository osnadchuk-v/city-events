import { db } from '@/db';
import { getSession } from './auth';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { events, users } from '@/db/schema';
import { cacheTag } from 'next/cache';

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) {
    return null;
  }

  try {
    const results = await db.select().from(users).where(eq(users.id, session.userId));
    return results[0] || null;
  } catch (e) {
    console.error(e);
    return null;
  }
});

export const getUserByEmail = async (email: string) => {
  try {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  } catch (e) {
    console.error(e);
    return null;
  }
};

export async function getEvents() {
  'use cache';
  cacheTag('events');
  try {
    const result = await db.query.events.findMany({
      with: {
        user: true,
      },
      orderBy: (e, { desc }) => [desc(e.createdAt)],
    });
    return result;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
}

export const getEvent = async (id: string) => {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      with: {
        user: true,
        sources: true,
      },
    });
    return event;
  } catch (e) {
    console.error(e);
    return null;
  }
};
