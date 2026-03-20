import ProtectedPage from '../../../src/components/guards/ProtectedPage';
import ProfilePage from '../../../src/views/ProfilePage';

export default function Page() {
  return (
    <ProtectedPage>
      <ProfilePage />
    </ProtectedPage>
  );
}
