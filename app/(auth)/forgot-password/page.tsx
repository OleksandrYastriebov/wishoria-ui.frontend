import type { Metadata } from 'next';
import GuestPage from '../../../src/components/guards/GuestPage';
import ForgotPasswordPage from '../../../src/views/ForgotPasswordPage';

export const metadata: Metadata = {
  title: 'Reset Password · Wishoria',
};

export default function Page() {
  return (
    <GuestPage>
      <ForgotPasswordPage />
    </GuestPage>
  );
}
