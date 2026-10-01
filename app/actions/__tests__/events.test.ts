import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteEvent } from '../events';
import { db } from '@/db';
import { getCurrentUser } from '@/lib/dal';
import { del } from '@vercel/blob';
import { updateTag } from 'next/cache';

vi.mock('@/db', () => ({
  db: {
    query: {
      events: {
        findFirst: vi.fn(),
      },
    },
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

vi.mock('@/lib/dal', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@vercel/blob', () => ({
  del: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}));

describe('events actions - deleteEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Unauthorized when user is not logged in', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await deleteEvent('event-1');
    expect(result).toEqual({ success: false, message: 'Unauthorized', error: 'Unauthorized' });
    expect(del).not.toHaveBeenCalled();
  });

  it('returns not found when event does not exist', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);
    vi.mocked(db.query.events.findFirst).mockResolvedValue(undefined);

    const result = await deleteEvent('event-1');
    expect(result).toEqual({ success: false, message: 'Подію не знайдено' });
    expect(del).not.toHaveBeenCalled();
  });

  it('returns Forbidden when event createdBy does not match user id', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);
    vi.mocked(db.query.events.findFirst).mockResolvedValue({
      id: 'event-1',
      createdBy: 'user-2',
      imagePath: 'path/to/image.jpg',
    } as any);

    const result = await deleteEvent('event-1');
    expect(result).toEqual({ success: false, message: 'Недостатньо прав', error: 'Forbidden' });
    expect(del).not.toHaveBeenCalled();
  });

  it('deletes image from storage if imagePath exists and deletes event from db', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);
    vi.mocked(db.query.events.findFirst).mockResolvedValue({
      id: 'event-1',
      createdBy: 'user-1',
      imagePath: 'events/poster-123.jpg',
    } as any);

    const result = await deleteEvent('event-1');
    expect(del).toHaveBeenCalledWith('events/poster-123.jpg');
    expect(db.delete).toHaveBeenCalled();
    expect(updateTag).toHaveBeenCalledWith('events');
    expect(result).toEqual({ success: true, message: 'Подію видалено' });
  });

  it('deletes event without calling del when imagePath is null/empty', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);
    vi.mocked(db.query.events.findFirst).mockResolvedValue({
      id: 'event-1',
      createdBy: 'user-1',
      imagePath: null,
    } as any);

    const result = await deleteEvent('event-1');
    expect(del).not.toHaveBeenCalled();
    expect(db.delete).toHaveBeenCalled();
    expect(updateTag).toHaveBeenCalledWith('events');
    expect(result).toEqual({ success: true, message: 'Подію видалено' });
  });

  it('proceeds with event deletion even if storage deletion fails', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);
    vi.mocked(db.query.events.findFirst).mockResolvedValue({
      id: 'event-1',
      createdBy: 'user-1',
      imagePath: 'events/missing-poster.jpg',
    } as any);
    vi.mocked(del).mockRejectedValueOnce(new Error('Storage error'));

    const result = await deleteEvent('event-1');
    expect(del).toHaveBeenCalledWith('events/missing-poster.jpg');
    expect(db.delete).toHaveBeenCalled();
    expect(result).toEqual({ success: true, message: 'Подію видалено' });
  });
});
