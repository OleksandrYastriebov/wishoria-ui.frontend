import type { Metadata } from 'next';
import GuestPage from '../../../src/components/guards/GuestPage';
import SignUpPage from '../../../src/views/SignUpPage';

export const metadata: Metadata = {
  title: 'Create Account · Wishoria',
};

export default function Page() {
  return (
    <GuestPage>
      <SignUpPage />
    </GuestPage>
  );
}
