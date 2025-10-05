
//Creamos la estructura Base que se repetira en toda las paginas
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
}