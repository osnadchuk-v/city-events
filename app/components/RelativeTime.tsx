'use client';

import { formatRelativeTime } from '@/lib/utils';

export default function TimeAgo({ date }: { date: Date | number }) {
  return <>{formatRelativeTime(new Date(date))}</>;
}
