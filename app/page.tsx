import { getEvents } from '@/lib/dal';
import Link from 'next/link';
import Button from './components/ui/Button';
import { PlusIcon } from 'lucide-react';
import EventCard from '@/app/components/EventCard';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
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
