import { useAuth } from '@/hooks/useAuth';
import { logout as firebaseLogout } from '@/services/auth';
import { clearLocalDatabase } from '@/services/api/recommendations'; // Asumiendo que la función está aquí
import { useNavigate, Link, useLocation } from 'react-router-dom';

export function Navbar() {
    const { user, logout: authContextLogout } = useAuth(); // Usamos el logout del contexto
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await firebaseLogout();
            // Ya no borramos la base de datos local. Los datos persisten para el modo offline.
            if (authContextLogout) authContextLogout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const navLinks = [
        { to: '/', text: 'Consultas', icon: '🔍' },
        { to: '/recommendations/new', text: 'Nueva Hoja', icon: '➕' },
        { to: '/products', text: 'Productos', icon: '📦' },
    ];

    const getLinkClass = (path) => {
        const baseClass = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200';
        return location.pathname === path
            ? `${baseClass} bg-primary-600 text-white font-bold shadow-md`
            : `${baseClass} text-gray-600 hover:bg-gray-100 hover:text-primary-600`;
    }

    return (
        <aside className="hidden lg:flex w-64 bg-white shadow-lg flex-col fixed h-full z-40">
            <div className="p-6 text-center border-b">
                <h1 className="text-2xl font-bold text-green-800">AgroGringo</h1>
                <p className="text-sm text-gray-500 mt-1">Hola, {user?.displayName || user?.email || 'Técnico'}</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navLinks.map(link => (
                    <Link key={link.to} to={link.to} className={getLinkClass(link.to)}>
                        <span className="text-xl">{link.icon}</span>
                        <span>{link.text}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:shadow-inner transition-colors duration-200">
                    <span className="text-xl">🚪</span>
                    <span className="font-semibold">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}