import { getEvent } from '@/lib/dal';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, Edit2Icon, LinkIcon, MapPinIcon } from 'lucide-react';
import TimeAgo from '@/app/components/RelativeTime';
import { EVENT_CATEGORIES, EVENT_STATUSES } from '@/db/schema';
import { EventLocation, EventOrganizer, EventPricing } from '@/lib/types';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import DeleteIssueButton from '@/app/components/DeleteIssueButton';

const EventPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) notFound();

  const {
    title,
    description,
    category,
    status,
    startDateTime,
    endDateTime,
    location,
    imageUrl,
    pricing,
    ageLimit,
    organizer,
    sourceUrl,
    createdAt,
    user,
  } = event;

  const categoryMeta = EVENT_CATEGORIES[category];
  const statusMeta = EVENT_STATUSES[status];
  const loc = location as EventLocation | null;
  const price = pricing as EventPricing | null;
  const org = organizer as EventOrganizer | null;

  const statusColors: Record<string, string> = {
    active: 'bg-green-900/50 text-green-300 border-green-700',
    cancelled: 'bg-red-900/50 text-red-300 border-red-700',
    postponed: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    finished: 'bg-gray-700 text-gray-300 border-gray-600',
  };

  return (
    <div className="max-w-7xl w-full mr-auto ml-auto p-4 md:p-8">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-200 mb-6">
        <ArrowLeftIcon size={16} className="mr-1" />
        Назад
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{categoryMeta.icon}</span>
            <span className="text-xs text-purple-400 font-medium">{categoryMeta.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[status]}`}>
              {statusMeta.label}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/events/${id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Edit2Icon size={14} className="mr-1" />
              Редагувати
            </Button>
          </Link>
          <DeleteIssueButton id={id} />
        </div>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Main content */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-4 space-y-5">
        {/* Date & time */}
        <div className="flex items-start gap-3 text-gray-300">
          <CalendarIcon size={18} className="mt-0.5 text-purple-400 shrink-0" />
          <div>
            <p className="font-medium text-white">{format(new Date(startDateTime), 'd MMMM yyyy', { locale: uk })}</p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <ClockIcon size={13} />
              {format(new Date(startDateTime), 'HH:mm')}
              {endDateTime && ` — ${format(new Date(endDateTime), 'HH:mm')}`}
            </p>
          </div>
        </div>

        {/* Location */}
        {loc && (
          <div className="flex items-start gap-3 text-gray-300">
            <MapPinIcon size={18} className="mt-0.5 text-purple-400 shrink-0" />
            <div>
              {loc.name && <p className="font-medium text-white">{loc.name}</p>}
              {loc.address && <p className="text-sm text-gray-400">{loc.address}</p>}
              <p className="text-sm text-gray-400">{loc.city}</p>
              {loc.onlineUrl && (
                <a
                  href={loc.onlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-1"
                >
                  <LinkIcon size={12} />
                  Посилання на трансляцію
                </a>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        {price && (
          <div className="flex items-start gap-3 text-gray-300">
            <span className="text-lg mt-0.5 shrink-0">🎟</span>
            <div>
              {price.type === 'free' && <p className="font-medium text-green-300">Безкоштовно</p>}
              {price.type === 'donation' && <p className="font-medium text-yellow-300">Донейшн</p>}
              {price.type === 'invitation' && <p className="font-medium text-blue-300">За запрошенням</p>}
              {price.type === 'paid' && (
                <p className="font-medium text-white">
                  {price.min != null && price.max != null
                    ? `${price.min} – ${price.max} ${price.currency ?? 'UAH'}`
                    : price.min != null
                      ? `від ${price.min} ${price.currency ?? 'UAH'}`
                      : price.max != null
                        ? `до ${price.max} ${price.currency ?? 'UAH'}`
                        : 'Платно'}
                </p>
              )}
              {price.ticketUrl && (
                <a
                  href={price.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-1"
                >
                  <LinkIcon size={12} />
                  Придбати квитки
                </a>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-sm text-gray-400 whitespace-pre-line">{description}</p>
          </div>
        )}
      </div>

      {/* Details sidebar */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Деталі</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {org && (
            <div>
              <p className="text-gray-500 mb-1">Організатор</p>
              {org.url ? (
                <a
                  href={org.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  {org.name}
                </a>
              ) : (
                <p className="text-white">{org.name}</p>
              )}
            </div>
          )}

          {ageLimit != null && (
            <div>
              <p className="text-gray-500 mb-1">Вікове обмеження</p>
              <p className="text-white">{ageLimit}+</p>
            </div>
          )}

          {sourceUrl && (
            <div>
              <p className="text-gray-500 mb-1">Джерело</p>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <LinkIcon size={12} />
                Перейти
              </a>
            </div>
          )}

          <div>
            <p className="text-gray-500 mb-1">Автор</p>
            <p className="text-white">{user.name ?? user.email}</p>
          </div>

          <div>
            <p className="text-gray-500 mb-1">Опубліковано</p>
            <p className="text-white">
              <TimeAgo date={createdAt} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
