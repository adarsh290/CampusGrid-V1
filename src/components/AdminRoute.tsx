import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  // 1. THE FIX: If we are still checking the disk, show a spinner (or nothing)
  // Do NOT redirect yet.
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // 2. Once loading is done, ONLY THEN check the role
  if (!user || user.role !== 'admin') {
    // If they aren't admin, kick them to Home
    return <Navigate to="/" replace />;
  }

  // 3. If Admin, let them pass
  return children;
};

export default AdminRoute;
