'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Event, EVENT_CATEGORIES } from '@/db/schema';
import Button from './ui/Button';
import { Form, FormError, FormGroup, FormInput, FormLabel, FormSelect, FormTextarea } from './ui/Form';
import { ActionResponse, createEvent, updateEvent } from '@/app/actions/events';
import { EventLocation, EventPricing, LocationType, PricingType } from '@/lib/types';
import type { EventFormData } from '@/lib/validations';
import { format } from 'date-fns';

interface EventFormProps {
  event?: Event;
  userId: string;
  isEditing?: boolean;
}

const initialState: ActionResponse = {
  success: false,
  message: '',
};

// ─── Field error ──────────────────────────────────────────────────────────────

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msgs = errors?.[field];
  if (!msgs?.length) return null;
  return <p className="text-xs text-red-400 mt-1">{msgs[0]}</p>;
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider pt-2">{children}</h3>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventForm({ event, userId, isEditing = false }: EventFormProps) {
  const router = useRouter();

  // Derive default date/time from event.startDateTime for controlled display
  const defaultDate = event?.startDateTime
    ? format(new Date(event.startDateTime), 'yyyy-MM-dd')
    : '';
  const defaultStartTime = event?.startDateTime
    ? format(new Date(event.startDateTime), 'HH:mm')
    : '';
  const defaultEndTime = event?.endDateTime
    ? format(new Date(event.endDateTime), 'HH:mm')
    : '';

  // Local state drives conditional field rendering
  const existingLocation = event?.location as EventLocation | null | undefined;
  const existingPricing = event?.pricing as EventPricing | null | undefined;

  const [locationType, setLocationType] = useState<LocationType>(
    existingLocation?.type ?? 'physical',
  );
  const [pricingType, setPricingType] = useState<PricingType>(
    existingPricing?.type ?? 'free',
  );

  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    async (_prev: ActionResponse, formData: FormData) => {
      const date = formData.get('date') as string;
      const startTime = formData.get('startTime') as string;
      const endTime = formData.get('endTime') as string;

      // Build ISO datetime strings from separate date/time inputs
      const startDateTime = date && startTime ? `${date}T${startTime}:00` : date;
      const endDateTime = date && endTime ? `${date}T${endTime}:00` : undefined;

      // Build location object only when there's a city value
      const city = formData.get('location.city') as string;
      const location = city
        ? {
            type: locationType,
            name: (formData.get('location.name') as string) || undefined,
            address: (formData.get('location.address') as string) || undefined,
            city,
            onlineUrl: (formData.get('location.onlineUrl') as string) || undefined,
          }
        : undefined;

      // Build pricing object
      const pricing =
        pricingType !== 'free'
          ? {
              type: pricingType,
              min: formData.get('pricing.min')
                ? Number(formData.get('pricing.min'))
                : undefined,
              max: formData.get('pricing.max')
                ? Number(formData.get('pricing.max'))
                : undefined,
              currency: 'UAH',
              ticketUrl: (formData.get('pricing.ticketUrl') as string) || undefined,
            }
          : { type: pricingType as PricingType };

      const organizerName = formData.get('organizer.name') as string;
      const organizer = organizerName
        ? {
            name: organizerName,
            url: (formData.get('organizer.url') as string) || undefined,
          }
        : undefined;

      const ageLimitRaw = formData.get('ageLimit') as string;
      const ageLimit = ageLimitRaw ? parseInt(ageLimitRaw, 10) : undefined;

      const data = {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        category: formData.get('category') as string,
        startDateTime,
        endDateTime,
        timezone: 'Europe/Kyiv',
        location,
        imageUrl: (formData.get('imageUrl') as string) || undefined,
        pricing,
        ageLimit,
        organizer,
        sourceUrl: (formData.get('sourceUrl') as string) || undefined,
        userId,
      } as Parameters<typeof createEvent>[0];

      try {
        const result = isEditing
          ? await updateEvent(event!.id, data)
          : await createEvent(data);

        if (result.success) {
          router.refresh();
          if (!isEditing) router.push('/dashboard');
        }

        return result;
      } catch (err) {
        return {
          success: false,
          message: (err as Error).message || 'Помилка',
        };
      }
    },
    initialState,
  );

  const categoryOptions = Object.values(EVENT_CATEGORIES).map(({ label, icon, value }) => ({
    label: `${icon} ${label}`,
    value,
  }));

  return (
    <Form action={formAction}>
      {state?.message && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            state.success
              ? 'bg-green-900/40 text-green-300 border border-green-700'
              : 'bg-red-900/40 text-red-300 border border-red-700'
          }`}
        >
          {state.message}
        </div>
      )}

      {/* ── Основна інформація ── */}
      <SectionTitle>Основна інформація</SectionTitle>

      <FormGroup>
        <FormLabel htmlFor="title">Назва *</FormLabel>
        <FormInput
          id="title"
          name="title"
          placeholder="Назва події"
          defaultValue={event?.title ?? ''}
          required
          minLength={3}
          maxLength={100}
          disabled={isPending}
          className={state?.errors?.title ? 'border-red-500' : ''}
        />
        <FieldError errors={state?.errors} field="title" />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="category">Категорія *</FormLabel>
        <FormSelect
          id="category"
          name="category"
          defaultValue={event?.category ?? 'other'}
          options={categoryOptions}
          disabled={isPending}
          required
          className={state?.errors?.category ? 'border-red-500' : ''}
        />
        <FieldError errors={state?.errors} field="category" />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="description">Опис</FormLabel>
        <FormTextarea
          id="description"
          name="description"
          placeholder="Розкажіть про подію..."
          rows={4}
          defaultValue={event?.description ?? ''}
          disabled={isPending}
        />
      </FormGroup>

      {/* ── Час ── */}
      <SectionTitle>Час</SectionTitle>

      <FormGroup>
        <FormLabel htmlFor="date">Дата *</FormLabel>
        <FormInput
          id="date"
          name="date"
          type="date"
          defaultValue={defaultDate}
          required
          disabled={isPending}
          className={state?.errors?.startDateTime ? 'border-red-500' : ''}
        />
        <FieldError errors={state?.errors} field="startDateTime" />
      </FormGroup>

      <div className="grid grid-cols-2 gap-4">
        <FormGroup>
          <FormLabel htmlFor="startTime">Початок *</FormLabel>
          <FormInput
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={defaultStartTime}
            required
            disabled={isPending}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="endTime">Кінець</FormLabel>
          <FormInput
            id="endTime"
            name="endTime"
            type="time"
            defaultValue={defaultEndTime}
            disabled={isPending}
          />
        </FormGroup>
      </div>

      {/* ── Місце ── */}
      <SectionTitle>Де?</SectionTitle>

      {/* Location type tabs */}
      <div className="flex gap-2">
        {(
          [
            { value: 'physical', label: '📍 Фізично' },
            { value: 'online', label: '💻 Онлайн' },
            { value: 'hybrid', label: '🔀 Гібрид' },
          ] as const
        ).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setLocationType(value)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              locationType === value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {(locationType === 'physical' || locationType === 'hybrid') && (
        <>
          <FormGroup>
            <FormLabel htmlFor="location.name">Назва місця</FormLabel>
            <FormInput
              id="location.name"
              name="location.name"
              placeholder="Палац мистецтв, Арена тощо"
              defaultValue={existingLocation?.name ?? ''}
              disabled={isPending}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="location.address">Адреса</FormLabel>
            <FormInput
              id="location.address"
              name="location.address"
              placeholder="вул. Шевченка, 1"
              defaultValue={existingLocation?.address ?? ''}
              disabled={isPending}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="location.city">Місто *</FormLabel>
            <FormInput
              id="location.city"
              name="location.city"
              placeholder="Львів"
              defaultValue={existingLocation?.city ?? 'Львів'}
              disabled={isPending}
            />
          </FormGroup>
        </>
      )}

      {(locationType === 'online' || locationType === 'hybrid') && (
        <FormGroup>
          <FormLabel htmlFor="location.onlineUrl">Посилання на трансляцію</FormLabel>
          <FormInput
            id="location.onlineUrl"
            name="location.onlineUrl"
            type="url"
            placeholder="https://zoom.us/j/..."
            defaultValue={existingLocation?.onlineUrl ?? ''}
            disabled={isPending}
          />
        </FormGroup>
      )}

      {/* ── Вхід ── */}
      <SectionTitle>Вхід</SectionTitle>

      <div className="flex gap-2 flex-wrap">
        {(
          [
            { value: 'free', label: '🎟 Безкоштовно' },
            { value: 'paid', label: '💳 Платно' },
            { value: 'donation', label: '💝 Донейшн' },
            { value: 'invitation', label: '✉️ За запрошенням' },
          ] as const
        ).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setPricingType(value)}
            className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              pricingType === value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {pricingType === 'paid' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <FormLabel htmlFor="pricing.min">Ціна від (грн)</FormLabel>
              <FormInput
                id="pricing.min"
                name="pricing.min"
                type="number"
                min={0}
                placeholder="200"
                defaultValue={existingPricing?.min ?? ''}
                disabled={isPending}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel htmlFor="pricing.max">Ціна до (грн)</FormLabel>
              <FormInput
                id="pricing.max"
                name="pricing.max"
                type="number"
                min={0}
                placeholder="500"
                defaultValue={existingPricing?.max ?? ''}
                disabled={isPending}
              />
            </FormGroup>
          </div>
          <FormGroup>
            <FormLabel htmlFor="pricing.ticketUrl">Посилання на квитки</FormLabel>
            <FormInput
              id="pricing.ticketUrl"
              name="pricing.ticketUrl"
              type="url"
              placeholder="https://tickets.ua/..."
              defaultValue={existingPricing?.ticketUrl ?? ''}
              disabled={isPending}
            />
          </FormGroup>
        </>
      )}

      {/* ── Додаткові деталі ── */}
      <SectionTitle>Додаткові деталі</SectionTitle>

      <FormGroup>
        <FormLabel htmlFor="organizer.name">Організатор</FormLabel>
        <FormInput
          id="organizer.name"
          name="organizer.name"
          placeholder="Назва організатора"
          defaultValue={
            event?.organizer
              ? (event.organizer as { name: string }).name
              : ''
          }
          disabled={isPending}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="imageUrl">Зображення (URL)</FormLabel>
        <FormInput
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://..."
          defaultValue={event?.imageUrl ?? ''}
          disabled={isPending}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="sourceUrl">Посилання на подію</FormLabel>
        <FormInput
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          placeholder="https://..."
          defaultValue={event?.sourceUrl ?? ''}
          disabled={isPending}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="ageLimit">Вікове обмеження</FormLabel>
        <FormInput
          id="ageLimit"
          name="ageLimit"
          type="number"
          min={0}
          max={21}
          placeholder="18"
          defaultValue={event?.ageLimit ?? ''}
          disabled={isPending}
        />
      </FormGroup>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          Скасувати
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEditing ? 'Зберегти зміни' : 'Створити подію'}
        </Button>
      </div>
    </Form>
  );
}
