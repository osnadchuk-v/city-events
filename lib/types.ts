import { Event, EventSource, User } from '@/db/schema';

// ─── JSONB field types ────────────────────────────────────────────────────────

export interface EventLocation {
  type: 'physical' | 'online' | 'hybrid';
  name?: string;
  address?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  onlineUrl?: string;
}

export interface EventPricing {
  type: 'free' | 'paid' | 'donation' | 'invitation';
  min?: number;
  max?: number;
  currency?: string;
  ticketUrl?: string;
}

export interface EventOrganizer {
  name: string;
  url?: string;
}

// ─── Category / Status types ──────────────────────────────────────────────────

export type EventCategory =
  | 'concerts'
  | 'theatre'
  | 'exhibitions'
  | 'cinema'
  | 'parties'
  | 'sports'
  | 'family'
  | 'education'
  | 'business'
  | 'food'
  | 'activities'
  | 'community'
  | 'festivals'
  | 'other';

export type EventStatus = 'active' | 'cancelled' | 'postponed' | 'finished';
export type EventSourceType = 'ai' | 'user';
export type LocationType = 'physical' | 'online' | 'hybrid';
export type PricingType = 'free' | 'paid' | 'donation' | 'invitation';

// ─── Composed types ───────────────────────────────────────────────────────────

export type EventWithUser = Event & {
  user: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>;
};

export type EventWithSources = Event & {
  sources: EventSource[];
};

export type EventWithUserAndSources = Event & {
  user: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>;
  sources: EventSource[];
};

// ─── Form / Action input types ────────────────────────────────────────────────

export type CreateEventInput = {
  title: string;
  description?: string;
  category: EventCategory;
  startDateTime: string; // ISO string
  endDateTime?: string;
  timezone?: string;
  location?: EventLocation;
  imageUrl?: string;
  pricing?: EventPricing;
  ageLimit?: number;
  organizer?: EventOrganizer;
  sourceUrl?: string;
  userId: string;
};

export type UpdateEventInput = Partial<Omit<CreateEventInput, 'userId'>>;
