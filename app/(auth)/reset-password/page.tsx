import type { Metadata } from 'next';
import GuestPage from '../../../src/components/guards/GuestPage';
import ResetPasswordPage from '../../../src/views/ResetPasswordPage';

export const metadata: Metadata = {
  title: 'Set New Password · Wishoria',
};

export default function Page() {
  return (
    <GuestPage>
      <ResetPasswordPage />
    </GuestPage>
  );
}
