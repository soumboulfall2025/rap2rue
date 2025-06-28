import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ArtistRoute({ children }) {
  const { isAuthenticated, role } = useSelector((state) => state.user);
  return isAuthenticated && role === 'artist' ? children : <Navigate to="/" replace />;
}
