import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/auth';
import { useNavigate, Link } from 'react-router-dom';

export function RecommendationList() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            // El AuthContext se encargará de redirigir, pero podemos ser explícitos
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className="max-w-6xl p-4 mx-auto">
            <header className="flex items-center justify-between pb-4 mb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold">Recomendaciones</h1>
                    {user && <p className="text-sm text-gray-500">Bienvenido, {user.email}</p>}
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        to="/recommendations/new"
                        className="px-4 py-2 font-medium text-white rounded-md bg-primary-600 hover:bg-primary-700">
                        + Nueva Recomendación
                    </Link>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                    Cerrar Sesión
                </button>
            </header>
            <div className="p-8 text-center bg-gray-50 rounded-md">
                <p className="text-gray-500">Aquí se mostrará la lista de recomendaciones...</p>
            </div>
        </div>
    );
}
