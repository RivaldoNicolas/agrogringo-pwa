//Creamos la estructura Base que se repetira en toda las paginas
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { BottomNavbar } from '@/components/BottomNavbar';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* --- Sidebar para LG y superior --- */}
            <Navbar />

            {/* --- Contenido Principal ---
                En móvil, tiene padding-bottom para no ser tapado por la BottomNavbar.
                En LG+, tiene padding-left para no ser tapado por la Sidebar. */}
            <main className="lg:ml-64 pb-24 lg:pb-4">
                <Outlet />
            </main>

            {/* --- Bottom Navbar para móvil/tablet --- */}
            <BottomNavbar />
        </div>
    );
}