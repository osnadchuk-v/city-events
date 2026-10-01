import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import EventCard from '../EventCard';
import { Event, EventCategory } from '@/db/schema';

describe('EventCard Component', () => {
  afterEach(() => {
    cleanup();
  });

  const mockEvent: Event = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Океан Ельзи',
    description: 'Великий концерт на стадіоні',
    category: EventCategory.CONCERTS,
    status: 'active',
    startDateTime: new Date('2026-05-22T19:00:00Z'),
    endDateTime: null,
    timezone: 'Europe/Kyiv',
    location: {
      type: 'physical',
      name: '!FESTrepublic',
      address: 'вул. Старознесенська, 24',
      city: 'Львів',
    },
    imageUrl: 'https://store_loqu05orrxnyslcz.public.blob.vercel-storage.com/concert.jpg',
    imagePath: 'concert.jpg',
    pricing: {
      type: 'paid',
      min: 500,
      currency: 'UAH',
    },
    ageLimit: null,
    organizer: {
      name: 'FEST',
    },
    sourceType: 'user',
    sourceUrl: null,
    sourceName: null,
    discoveredAt: null,
    createdBy: 'user-1',
    createdAt: new Date('2026-05-01T12:00:00Z'),
    updatedAt: new Date('2026-05-01T12:00:00Z'),
  };

  it('renders event title, category badge, and location', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText('Океан Ельзи')).toBeTruthy();
    expect(screen.getByText('Концерт')).toBeTruthy();
    expect(screen.getByText('!FESTrepublic')).toBeTruthy();
  });

  it('renders single-day date format with time', () => {
    render(<EventCard event={mockEvent} />);

    // Checks for Ukrainian month name and time
    expect(screen.getByText(/22 травня • \d{2}:\d{2}/i)).toBeTruthy();
  });

  it('renders date range for multi-day events', () => {
    const multiDayEvent: Event = {
      ...mockEvent,
      category: EventCategory.EXHIBITIONS,
      title: 'Виставка сучасного мистецтва',
      startDateTime: new Date('2026-05-23T10:00:00Z'),
      endDateTime: new Date('2026-06-30T18:00:00Z'),
      location: {
        type: 'physical',
        name: 'Музей Івана Труша',
        city: 'Львів',
      },
    };

    render(<EventCard event={multiDayEvent} />);

    expect(screen.getByText('Виставка сучасного мистецтва')).toBeTruthy();
    expect(screen.getByText('Виставка')).toBeTruthy();
    expect(screen.getByText('Музей Івана Труша')).toBeTruthy();
    expect(screen.getByText(/23 травня – 30 червня/i)).toBeTruthy();
  });

  it('renders event details', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText('Океан Ельзи')).toBeTruthy();
    expect(screen.getByText('!FESTrepublic')).toBeTruthy();
  });
});
