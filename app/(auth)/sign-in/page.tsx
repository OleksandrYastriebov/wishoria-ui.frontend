import type { Metadata } from 'next';
import GuestPage from '../../../src/components/guards/GuestPage';
import SignInPage from '../../../src/views/SignInPage';

export const metadata: Metadata = {
  title: 'Sign In · Wishoria',
};

export default function Page() {
  return (
    <GuestPage>
      <SignInPage />
    </GuestPage>
  );
}
