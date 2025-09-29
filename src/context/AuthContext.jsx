import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// 1. Crear el contexto
export const AuthContext = createContext();

// 2. Crear el proveedor del contexto
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged es un observador de Firebase que se ejecuta
        // cada vez que el estado de autenticación cambia (login/logout).
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // Limpiar el observador cuando el componente se desmonte
        return () => unsubscribe();
    }, []);

    // Mientras se verifica el estado de autenticación, muestra un spinner
    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    // El 'value' es lo que los componentes hijos podrán consumir
    const value = {
        user,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
