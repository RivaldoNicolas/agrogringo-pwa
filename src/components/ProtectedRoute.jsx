import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
    const { user } = useAuth();

    // Si no hay usuario, redirige a la página de login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si hay usuario, renderiza el contenido de la ruta (Outlet)
    return <Outlet />;
}
