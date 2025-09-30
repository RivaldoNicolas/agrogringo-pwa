import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Login } from '@/pages/Login';
import { RecommendationForm } from '@/pages/RecommendationForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/layouts/MainLayout';
import { ConsultationPage } from '@/pages/ConsultationPage';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Si el usuario está logueado y va a /login, lo redirigimos a la página de creación */}
      <Route path="/login" element={user ? <Navigate to="/recommendations/new" /> : <Login />} />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        {/* Usamos MainLayout para que todas estas páginas tengan la barra de navegación */}
        <Route element={<MainLayout />}>
          {/* La página principal ahora es la de consulta */}
          <Route path="/" element={<ConsultationPage />} />
          {/* La página para crear una nueva recomendación */}
          <Route path="/recommendations/new" element={<RecommendationForm />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
