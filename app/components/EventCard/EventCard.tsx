import { format, isSameDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import Link from 'next/link';
import { Event, EventCategory } from '@/db/schema';
import { EventLocation } from '@/lib/types';
import Image from 'next/image';
import { CATEGORY_STYLES, DEFAULT_CATEGORY_STYLE } from './constants';

interface EventCardProps {
  event: Event;
}

function formatEventDate(startDateTime: Date | string, endDateTime?: Date | string | null): string {
  const start = new Date(startDateTime);
  if (!endDateTime) {
    return format(start, "d MMMM '•' HH:mm", { locale: uk });
  }

  const end = new Date(endDateTime);
  if (isSameDay(start, end)) {
    return `${format(start, 'd MMMM', { locale: uk })} • ${format(start, 'HH:mm')}`;
  }

  // Multi-day event (e.g. "23 травня – 30 червня")
  return `${format(start, 'd MMMM', { locale: uk })} – ${format(end, 'd MMMM', { locale: uk })}`;
}

const EventCard = ({ event }: EventCardProps) => {
  const catStyle = (event.category && CATEGORY_STYLES[event.category as EventCategory]) || {
    label: event.category || DEFAULT_CATEGORY_STYLE.label,
    badgeClass: DEFAULT_CATEGORY_STYLE.badgeClass,
  };

  const loc = event.location as EventLocation | null;
  const locationName = loc?.name || loc?.address || loc?.city || 'Місце уточнюється';
  const formattedDate = formatEventDate(event.startDateTime, event.endDateTime);

  return (
    <Link
      key={event.id}
      href={`/events/${event.id}`}
      className="group relative flex flex-col w-full rounded-2xl bg-[#14161f] overflow-hidden border border-[#232738]/70 hover:border-gray-600/60 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1"
    >
      {/* Image Banner */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-900">
        {event.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <Image
            width={200}
            height={200}
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-3xl text-gray-600 font-bold">{event.title.charAt(0)}</span>
          </div>
        )}

        {/* Category Pill */}
        <div
          className={`absolute bottom-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm ${catStyle.badgeClass}`}
        >
          {catStyle.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <h3 className="font-semibold text-white text-base md:text-lg leading-snug line-clamp-1 group-hover:text-purple-300 transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-gray-400 font-normal mt-1">{formattedDate}</p>
          <p className="text-sm text-gray-400 font-normal truncate mt-0.5">{locationName}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;