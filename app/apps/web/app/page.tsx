import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to map page as the default landing
  redirect('/map');
}

