import ProtectedPage from '../../../src/components/guards/ProtectedPage';
import WishlistsPage from '../../../src/views/WishlistsPage';

export default function Page() {
  return (
    <ProtectedPage>
      <WishlistsPage />
    </ProtectedPage>
  );
}
