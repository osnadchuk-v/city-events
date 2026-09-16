import { redirect } from 'next/navigation';
import EventForm from './EventForm';
import { getCurrentUser } from '@/lib/dal';

const NewEvent = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }

  return <EventForm userId={user.id} />;
};

export default NewEvent;
