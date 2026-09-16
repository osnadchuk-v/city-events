import { InferSelectModel, relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const eventCategoryEnum = pgEnum('event_category', [
  'concerts',
  'theatre',
  'exhibitions',
  'cinema',
  'parties',
  'sports',
  'family',
  'education',
  'business',
  'food',
  'activities',
  'community',
  'festivals',
  'other',
]);

export const eventStatusEnum = pgEnum('event_status', [
  'active',
  'cancelled',
  'postponed',
  'finished',
]);

export const eventSourceEnum = pgEnum('event_source_type', ['ai', 'user']);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Events ──────────────────────────────────────────────────────────────────

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: eventCategoryEnum('category').notNull(),
  status: eventStatusEnum('status').default('active').notNull(),

  // Dates
  startDateTime: timestamp('start_date_time').notNull(),
  endDateTime: timestamp('end_date_time'),
  timezone: text('timezone').default('Europe/Kyiv').notNull(),

  // Location as JSONB — не окрема таблиця, бо join не потрібен
  location: jsonb('location').$type<{
    type: 'physical' | 'online' | 'hybrid';
    name?: string;
    address?: string;
    city: string;
    latitude?: number;
    longitude?: number;
    onlineUrl?: string;
  }>(),

  imageUrl: text('image_url'),

  // Pricing as JSONB
  pricing: jsonb('pricing').$type<{
    type: 'free' | 'paid' | 'donation' | 'invitation';
    min?: number;
    max?: number;
    currency?: string;
    ticketUrl?: string;
  }>(),

  ageLimit: integer('age_limit'),

  // Organizer as JSONB
  organizer: jsonb('organizer').$type<{
    name: string;
    url?: string;
  }>(),

  // Source info (для AI-знайдених подій)
  sourceType: eventSourceEnum('source_type').default('user').notNull(),
  sourceUrl: text('source_url'),
  sourceName: text('source_name'),
  discoveredAt: timestamp('discovered_at'),

  // Relations
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Event Sources ────────────────────────────────────────────────────────────

export const eventSources = pgTable('event_sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  sourceName: text('source_name').notNull(),
  discoveredAt: timestamp('discovered_at').notNull(),
  lastCheckedAt: timestamp('last_checked_at').notNull(),
  extractedByAI: boolean('extracted_by_ai').default(false).notNull(),
  confidence: real('confidence'),
  rawData: jsonb('raw_data'),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  sources: many(eventSources),
}));

export const eventSourcesRelations = relations(eventSources, ({ one }) => ({
  event: one(events, {
    fields: [eventSources.eventId],
    references: [events.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
}));

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Event = InferSelectModel<typeof events>;
export type EventSource = InferSelectModel<typeof eventSources>;
export type User = InferSelectModel<typeof users>;

// ─── Category metadata ────────────────────────────────────────────────────────

export const EVENT_CATEGORIES = {
  concerts: { label: 'Концерти', icon: '🎵', value: 'concerts' },
  theatre: { label: 'Театр', icon: '🎭', value: 'theatre' },
  exhibitions: { label: 'Виставки', icon: '🎨', value: 'exhibitions' },
  cinema: { label: 'Кіно', icon: '🎬', value: 'cinema' },
  parties: { label: 'Вечірки', icon: '🥳', value: 'parties' },
  sports: { label: 'Спорт', icon: '⚽', value: 'sports' },
  family: { label: 'Для сім\'ї', icon: '👨‍👩‍👧', value: 'family' },
  education: { label: 'Освіта', icon: '🎓', value: 'education' },
  business: { label: 'Бізнес', icon: '💼', value: 'business' },
  food: { label: 'Їжа / гастрономія', icon: '🍔', value: 'food' },
  activities: { label: 'Активності', icon: '🏃', value: 'activities' },
  community: { label: 'Зустрічі / ком\'юніті', icon: '🧑‍🤝‍🧑', value: 'community' },
  festivals: { label: 'Фестивалі', icon: '🎪', value: 'festivals' },
  other: { label: 'Інше', icon: '📌', value: 'other' },
} as const;

export const EVENT_STATUSES = {
  active: { label: 'Активна', value: 'active' },
  cancelled: { label: 'Скасована', value: 'cancelled' },
  postponed: { label: 'Перенесена', value: 'postponed' },
  finished: { label: 'Завершена', value: 'finished' },
} as const;
