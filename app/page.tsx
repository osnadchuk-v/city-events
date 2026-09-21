import { getEvents } from '@/lib/dal';
import Link from 'next/link';
import Button from './components/ui/Button';
import { PlusIcon } from 'lucide-react';
import { EVENT_CATEGORIES, EVENT_STATUSES } from '@/db/schema';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

export default async function DashboardPage() {
  const events = await getEvents();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Мої події</h1>
        <Link href="/events/new">
          <Button>
            <span className="flex items-center">
              <PlusIcon size={18} className="mr-2" />
              Створити подію
            </span>
          </Button>
        </Link>
      </div>

      {events.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-400 bg-gray-800 border-b border-gray-700">
            <div className="col-span-5">Назва</div>
            <div className="col-span-2">Категорія</div>
            <div className="col-span-2">Статус</div>
            <div className="col-span-3">Дата</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-700">
            {events.map((event) => {
              const cat = EVENT_CATEGORIES[event.category];
              const st = EVENT_STATUSES[event.status];
              const statusColors: Record<string, string> = {
                active: 'text-green-400',
                cancelled: 'text-red-400',
                postponed: 'text-yellow-400',
                finished: 'text-gray-400',
              };

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-700 transition-colors text-gray-200"
                >
                  <div className="col-span-5 font-medium truncate">{event.title}</div>
                  <div className="col-span-2 text-sm text-gray-400">
                    {cat.icon} {cat.label}
                  </div>
                  <div className={`col-span-2 text-sm font-medium ${statusColors[event.status]}`}>{st.label}</div>
                  <div className="col-span-3 text-sm text-gray-500">
                    {format(new Date(event.startDateTime), 'd MMM, HH:mm', { locale: uk })}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-gray-700 rounded-lg bg-gray-800 p-8">
          <h3 className="text-lg font-medium mb-2 text-white">Подій ще немає</h3>
          <p className="text-gray-400 mb-6">Створіть першу подію прямо зараз.</p>
          <Link href="/events/new">
            <Button>
              <span className="flex items-center">
                <PlusIcon size={18} className="mr-2" />
                Створити подію
              </span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
