import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/auth';
import { clearLocalDatabase } from '@/services/database/dexieConfig';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            await clearLocalDatabase(); // Limpia la base de datos local al cerrar sesión
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const getLinkClass = (path) => {
        return location.pathname === path
            ? 'px-4 py-2 font-bold text-white rounded-md bg-primary-700'
            : 'px-4 py-2 font-medium text-white rounded-md bg-primary-600 hover:bg-primary-700';
    }

    return (
        <header className="flex items-center justify-between p-4 mb-4 text-white bg-green-800 shadow-md">
            <div>
                <h1 className="text-xl font-bold">AGROTEC</h1>
                {user && <p className="text-sm text-gray-300">Bienvenido, {user.email}</p>}
            </div>
            <nav className="flex items-center gap-4">
                <Link to="/recommendations/new" className={getLinkClass('/recommendations/new')}>+ Nueva Recomendación</Link>
                <Link to="/" className={getLinkClass('/')}>Consultar Recomendaciones</Link>
            </nav>
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Cerrar Sesión</button>
        </header>
    );
}