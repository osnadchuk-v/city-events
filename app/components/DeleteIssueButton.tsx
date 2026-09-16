'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Button from './ui/Button';
import { Trash2Icon } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteEvent } from '@/app/actions/events';

interface DeleteIssueButtonProps {
  id: string;
}

export default function DeleteIssueButton({ id }: DeleteIssueButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const result = await deleteEvent(id);

        if (!result.success) {
          throw new Error(result.error || 'Не вдалося видалити подію');
        }

        toast.success('Подію видалено');
        router.push('/dashboard');
        router.refresh();
      } catch (error) {
        toast.error('Помилка при видаленні');
        console.error('Error deleting event:', error);
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)} disabled={isPending}>
          Скасувати
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isPending}>
          Видалити
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setShowConfirm(true)}>
      <span className="flex items-center">
        <Trash2Icon size={14} className="mr-1" />
        Видалити
      </span>
    </Button>
  );
}
