import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logout as firebaseLogout } from '@/services/auth';
import toast from 'react-hot-toast';

const navLinks = [
    { to: '/', text: 'Consultas', icon: '🔍' },
    { to: '/recommendations/new', text: 'Nueva', icon: '➕' },
    { to: '/products', text: 'Productos', icon: '📦' },
];

export function BottomNavbar() {
    const { logout: authContextLogout } = useAuth();
    const navigate = useNavigate();

    const activeLinkClass = "text-primary-600";
    const inactiveLinkClass = "text-gray-500 hover:text-primary-600";

    const handleLogout = async () => {
        try {
            await firebaseLogout();
            if (authContextLogout) authContextLogout();
            navigate('/login');
        } catch (error) {
            toast.error('Error al cerrar sesión.');
            console.error('Error al cerrar sesión desde el móvil:', error);
        }
    };

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-50">
            <div className="flex justify-around h-16 items-center">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center text-center w-full transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`
                        }
                    >
                        <span className="text-2xl">{link.icon}</span>
                        <span className="text-xs font-medium">{link.text}</span>
                    </NavLink>
                ))}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center text-center w-full text-gray-500 hover:text-red-600 transition-colors duration-200"
                >
                    <span className="text-2xl">🚪</span>
                    <span className="text-xs font-medium">Salir</span>
                </button>
            </div>
        </nav>
    );
}