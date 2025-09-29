import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Login } from '@/pages/Login';
import { RecommendationList } from '@/pages/RecommendationList';
import { RecommendationForm } from '@/pages/RecommendationForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Si el usuario está logueado y va a /login, lo redirigimos a la home */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RecommendationList />} />
        <Route path="/recommendations/new" element={<RecommendationForm />} />
        {/* Aquí irían el resto de tus rutas protegidas */}
      </Route>
    </Routes>
  );
}

export default App;
