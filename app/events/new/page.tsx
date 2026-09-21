import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import NewEvent from '@/app/components/NewEvent';

export default async function NewEventPage() {
  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-200 mb-6">
        <ArrowLeftIcon size={16} className="mr-1" />
        Назад
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-white">Створити подію</h1>

      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm p-6">
        <Suspense fallback={<div className="text-gray-400 text-sm">Завантаження...</div>}>
          <NewEvent />
        </Suspense>
      </div>
    </div>
  );
}
