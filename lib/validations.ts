import { z } from 'zod';

const LocationSchema = z.object({
  type: z.enum(['physical', 'online', 'hybrid']),
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1, "Місто обов'язкове"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  onlineUrl: z.url('Невірне посилання').optional().or(z.literal('')),
});

const PricingSchema = z.object({
  type: z.enum(['free', 'paid', 'donation', 'invitation']),
  min: z.number().min(0).optional(),
  max: z.number().min(0).optional(),
  currency: z.string().default('UAH').optional(),
  ticketUrl: z.url('Невірне посилання').optional().or(z.literal('')),
});

const OrganizerSchema = z.object({
  name: z.string().min(1),
  url: z.url('Невірне посилання').optional().or(z.literal('')),
});

export const CATEGORIES = [
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
] as const;

export const EventSchema = z.object({
  title: z.string().min(3, 'Назва має бути не менше 3 символів').max(100, 'Назва має бути не більше 100 символів'),
  description: z.string().optional(),
  category: z.enum(CATEGORIES, { error: () => ({ message: 'Оберіть категорію' }) }),
  startDateTime: z.string().min(1, "Дата початку обов'язкова"),
  endDateTime: z.string().optional(),
  timezone: z.string().default('Europe/Kyiv'),
  location: LocationSchema.optional(),
  imageUrl: z.url('Невірне посилання').optional().or(z.literal('')),
  pricing: PricingSchema.optional(),
  ageLimit: z.number().int().min(0).max(21).optional(),
  organizer: OrganizerSchema.optional(),
  sourceUrl: z.url('Невірне посилання').optional().or(z.literal('')),
  userId: z.string().min(1),
});

export type EventFormData = z.infer<typeof EventSchema>;
