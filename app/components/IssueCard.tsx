import { Event, EVENT_CATEGORIES, EVENT_STATUSES } from '@/db/schema';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import TimeAgo from '@/app/components/RelativeTime';
import { EventLocation } from '@/lib/types';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface IssueCardProps {
  issue: Event;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const { id, title, description, status, category, createdAt, startDateTime, location } = issue;

  const cat = EVENT_CATEGORIES[category];
  const st = EVENT_STATUSES[status];
  const loc = location as EventLocation | null;

  const statusColors: Record<string, string> = {
    active: 'text-green-400 bg-green-900/30',
    cancelled: 'text-red-400 bg-red-900/30',
    postponed: 'text-yellow-400 bg-yellow-900/30',
    finished: 'text-gray-400 bg-gray-700',
  };

  return (
    <Link href={`/events/${id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-1 text-xs text-purple-400 mb-1">
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </div>
          <CardTitle className="line-clamp-1 text-base text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          {description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{description}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[status]}`}>
              {st.label}
            </span>
            <span className="text-gray-400">
              {format(new Date(startDateTime), 'd MMM, HH:mm', { locale: uk })}
            </span>
            {loc?.city && <span className="text-gray-400">📍 {loc.city}</span>}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          <TimeAgo date={createdAt} />
        </CardFooter>
      </Card>
    </Link>
  );
}
