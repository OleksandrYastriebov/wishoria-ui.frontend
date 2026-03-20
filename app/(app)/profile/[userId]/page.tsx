import ProtectedPage from '../../../../src/components/guards/ProtectedPage';
import PublicProfilePage from '../../../../src/views/PublicProfilePage';

export default function Page() {
  return (
    <ProtectedPage>
      <PublicProfilePage />
    </ProtectedPage>
  );
}
