'use server';

import { db } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/dal';
import { updateTag } from 'next/cache';
import { EventFormData, EventSchema } from '@/lib/validations';

export type { EventFormData };

export type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
  eventId?: string;
};

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createEvent(data: EventFormData): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized', error: 'Unauthorized' };
    }

    const validation = EventSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: 'Помилка валідації',
        errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const d = validation.data;

    const [created] = await db
      .insert(events)
      .values({
        title: d.title,
        description: d.description ?? null,
        category: d.category,
        status: 'active',
        startDateTime: new Date(d.startDateTime),
        endDateTime: d.endDateTime ? new Date(d.endDateTime) : null,
        timezone: d.timezone,
        location: d.location ?? null,
        imageUrl: d.imageUrl || null,
        pricing: d.pricing ?? null,
        ageLimit: d.ageLimit ?? null,
        organizer: d.organizer ?? null,
        sourceType: 'user',
        sourceUrl: d.sourceUrl || null,
        createdBy: user.id,
      })
      .returning({ id: events.id });

    updateTag('events');
    return { success: true, message: 'Подію створено', eventId: created.id };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, message: 'Помилка при створенні події', error: 'Failed to create event' };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateEvent(id: string, data: Partial<EventFormData>): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized', error: 'Unauthorized' };
    }

    const existing = await db.query.events.findFirst({ where: eq(events.id, id) });
    if (!existing) {
      return { success: false, message: 'Подію не знайдено' };
    }
    if (existing.createdBy !== user.id) {
      return { success: false, message: 'Недостатньо прав', error: 'Forbidden' };
    }

    const PartialSchema = EventSchema.partial();
    const validation = PartialSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: 'Помилка валідації',
        errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const d = validation.data;
    const patch: Record<string, unknown> = {};

    if (d.title !== undefined) patch.title = d.title;
    if (d.description !== undefined) patch.description = d.description;
    if (d.category !== undefined) patch.category = d.category;
    if (d.startDateTime !== undefined) patch.startDateTime = new Date(d.startDateTime);
    if (d.endDateTime !== undefined) patch.endDateTime = new Date(d.endDateTime);
    if (d.timezone !== undefined) patch.timezone = d.timezone;
    if (d.location !== undefined) patch.location = d.location;
    if (d.imageUrl !== undefined) patch.imageUrl = d.imageUrl || null;
    if (d.pricing !== undefined) patch.pricing = d.pricing;
    if (d.ageLimit !== undefined) patch.ageLimit = d.ageLimit;
    if (d.organizer !== undefined) patch.organizer = d.organizer;
    if (d.sourceUrl !== undefined) patch.sourceUrl = d.sourceUrl || null;
    patch.updatedAt = new Date();

    await db.update(events).set(patch).where(eq(events.id, id));

    updateTag('events');
    return { success: true, message: 'Подію оновлено', eventId: id };
  } catch (error) {
    console.error('Error updating event:', error);
    return { success: false, message: 'Помилка при оновленні події', error: 'Failed to update event' };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteEvent(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized', error: 'Unauthorized' };
    }

    const existing = await db.query.events.findFirst({ where: eq(events.id, id) });
    if (!existing) {
      return { success: false, message: 'Подію не знайдено' };
    }
    if (existing.createdBy !== user.id) {
      return { success: false, message: 'Недостатньо прав', error: 'Forbidden' };
    }

    await db.delete(events).where(eq(events.id, id));

    updateTag('events');
    return { success: true, message: 'Подію видалено' };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, message: 'Помилка при видаленні події', error: 'Failed to delete event' };
  }
}
