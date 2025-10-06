import { useState, useEffect } from 'react';
import { getAllRecommendations, deleteRecommendation } from '@/services/api/recommendations';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/solid'; // Necesitarás instalar @heroicons/react
import { Link } from 'react-router-dom';

export function ConsultationPage() {
    const [recommendations, setRecommendations] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Estados para los filtros
    const [clientFilter, setClientFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false); // Estado para mostrar/ocultar filtros en móvil

    // Estilos para los estados, para mantener consistencia
    const estadoStyles = {
        'Pendiente': 'bg-yellow-100 text-yellow-800',
        'En tratamiento': 'bg-blue-100 text-blue-800',
        'Finalizado': 'bg-green-100 text-green-800',
    };

    useEffect(() => {
        const fetchRecommendations = async () => {
            // No hacer nada si el usuario aún no ha cargado
            if (!user) return;

            try {
                setLoading(true);
                const data = await getAllRecommendations(user.uid);
                setRecommendations(data);
                setFilteredData(data); // Inicialmente mostrar todos
            } catch (err) {
                setError('No se pudieron cargar las recomendaciones.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations(); // Se ejecutará cada vez que 'user' cambie
    }, [user]); // Dependemos del objeto 'user' completo

    const applyFilters = () => {
        let data = [...recommendations];

        if (clientFilter) {
            const lowerCaseFilter = clientFilter.toLowerCase();
            data = data.filter(item =>
                item.datosAgricultor.nombre.toLowerCase().includes(lowerCaseFilter) ||
                item.datosAgricultor.dni.includes(lowerCaseFilter)
            );
        }

        if (statusFilter) {
            data = data.filter(item => item.estado === statusFilter);
        }

        if (dateFromFilter) {
            data = data.filter(item => new Date(item.fecha) >= new Date(dateFromFilter));
        }

        if (dateToFilter) {
            data = data.filter(item => new Date(item.fecha) <= new Date(dateToFilter));
        }

        setFilteredData(data);
    };

    const clearFilters = () => {
        setClientFilter('');
        setStatusFilter('');
        setDateFromFilter('');
        setDateToFilter('');
        setFilteredData(recommendations);
    };

    const handleDelete = async (localId, nombreCliente) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la recomendación para "${nombreCliente}"? Esta acción no se puede deshacer.`)) {
            try {
                await deleteRecommendation(localId);
                // Actualizar el estado para reflejar la eliminación en la UI
                const updatedRecommendations = recommendations.filter(rec => rec.localId !== localId);
                setRecommendations(updatedRecommendations);
                setFilteredData(updatedRecommendations);
                alert('Recomendación eliminada con éxito.');
            } catch (err) {
                alert('Error al eliminar la recomendación.');
                console.error(err);
            }
        }
    };

    const handleQuickDateFilter = (days) => {
        const today = new Date();
        const fromDate = new Date();

        if (days === 90) { // "Hace 3 meses"
            fromDate.setMonth(today.getMonth() - 3);
        } else {
            fromDate.setDate(today.getDate() - days);
        }

        // Formatear a YYYY-MM-DD
        const toDateStr = today.toISOString().split('T')[0];
        const fromDateStr = fromDate.toISOString().split('T')[0];

        setDateFromFilter(fromDateStr);
        setDateToFilter(toDateStr);
        // Nota: El filtro se aplica al hacer clic en "Aplicar Filtros"
    };

    if (loading) return <p className="p-4 text-center">Cargando recomendaciones...</p>;
    if (error) return <p className="p-4 text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* HEADER DE LA PÁGINA */}
                <div className="bg-gradient-to-r from-green-800 to-green-600 text-white p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <div className="text-4xl mr-4">🌱</div>
                            <div>
                                <h1 className="text-2xl font-bold">Consulta de Recomendaciones</h1>
                                <p className="text-sm opacity-90">Gestión y Seguimiento</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => alert('Funcionalidad de exportar a Excel pendiente de implementación.')}
                                className="btn-export bg-white/20 border-white/30 hover:bg-white/30 border-2 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                            >
                                📊 Excel
                            </button>
                            <button
                                onClick={() => alert('Funcionalidad de exportar a PDF pendiente de implementación.')}
                                className="btn-export bg-white/20 border-white/30 hover:bg-white/30 border-2 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                            >
                                📄 PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="bg-gray-50 border-b">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full p-4 flex justify-between items-center text-left text-gray-700 font-bold lg:hidden"
                    >
                        <span>
                            <FunnelIcon className="h-5 w-5 inline-block mr-2" />
                            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                        </span>
                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`p-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="filter-label font-semibold text-gray-700 mb-1 block">👤 Cliente (DNI/Nombre)</label>
                                <input type="text" value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="filter-input w-full p-2 border-2 border-gray-200 rounded-lg" placeholder="Buscar cliente..." />
                            </div>
                            <div>
                                <label className="filter-label font-semibold text-gray-700 mb-1 block">🔄 Estado</label>
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select w-full p-2 border-2 border-gray-200 rounded-lg">
                                    <option value="">Todos</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En tratamiento">En tratamiento</option>
                                    <option value="Finalizado">Finalizado</option>
                                </select>
                            </div>
                            <div>
                                <label className="filter-label font-semibold text-gray-700 mb-1 block">📅 Desde</label>
                                <input type="date" value={dateFromFilter} onChange={e => setDateFromFilter(e.target.value)} className="filter-input w-full p-2 border-2 border-gray-200 rounded-lg" />
                            </div>
                            <div>
                                <label className="filter-label font-semibold text-gray-700 mb-1 block">📅 Hasta</label>
                                <input type="date" value={dateToFilter} onChange={e => setDateToFilter(e.target.value)} className="filter-input w-full p-2 border-2 border-gray-200 rounded-lg" />
                            </div>
                        </div>
                        <div className="flex justify-center gap-2 mt-4 text-sm">
                            <button onClick={() => handleQuickDateFilter(1)} className="btn-quick-filter">Último día</button>
                            <button onClick={() => handleQuickDateFilter(30)} className="btn-quick-filter">Últimos 30 días</button>
                            <button onClick={() => handleQuickDateFilter(90)} className="btn-quick-filter">Últimos 3 meses</button>
                            <style>{`
                            .btn-quick-filter { @apply bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300; }
                        `}</style>
                        </div>
                        <div className="flex justify-center gap-4 mt-6">
                            <button onClick={applyFilters} className="btn-filter bg-gradient-to-r from-green-600 to-green-800 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2">
                                🔍 Aplicar Filtros
                            </button>
                            <button onClick={clearFilters} className="btn-clear-filters bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">
                                🗑️ Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RESULTADOS */}
            <div className="p-2 sm:p-4">
                <div className="results-header mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-700">Resultados</h2>
                    <div className="results-count font-semibold text-gray-600">
                        Mostrando <strong>{filteredData.length}</strong> de <strong>{recommendations.length}</strong>
                    </div>
                </div>

                {/* VISTA DE TABLA (para pantallas grandes) */}
                <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-gray-100">
                            <tr className="text-left text-gray-600">
                                <th className="p-3 font-semibold">N° Hoja</th>
                                <th className="p-3 font-semibold">Fecha</th>
                                <th className="p-3 font-semibold">Cliente</th>
                                <th className="p-3 font-semibold">Estado</th>
                                <th className="p-3 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map((rec) => (
                                <tr key={rec.localId} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-mono font-bold text-green-700">{rec.noHoja}</td>
                                    <td className="p-3">{new Date(rec.fecha).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        <div className="font-semibold">{rec.datosAgricultor.nombre}</div>
                                        <div className="text-xs text-gray-500">DNI: {rec.datosAgricultor.dni}</div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${estadoStyles[rec.estado] || 'bg-gray-100'}`}>
                                            {rec.estado}
                                        </span>
                                    </td>
                                    <td className="p-3 flex gap-2 justify-center">
                                        <Link to={`/recommendations/${rec.localId}`} className="btn-action bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded flex items-center gap-1">👁️ Ver</Link>
                                        <Link to={`/recommendations/${rec.localId}/follow-up`} className="btn-action bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded flex items-center gap-1">📸 Seguir</Link>
                                        <button onClick={() => alert('La funcionalidad de editar se implementará en la Fase 2.')} className="btn-action bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded">✏️ Edit</button>
                                        <button onClick={() => handleDelete(rec.localId, rec.datosAgricultor.nombre)} className="btn-action bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded flex items-center gap-1">🗑️ Eliminar</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-8 text-gray-500">
                                        <div className="text-4xl mb-2">📋</div>
                                        <h3 className="font-bold text-lg">No se encontraron recomendaciones</h3>
                                        <p>Prueba ajustando los filtros o crea una nueva recomendación.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* VISTA DE TARJETAS (para pantallas pequeñas) */}
                <div className="lg:hidden space-y-4">
                    {filteredData.length > 0 ? filteredData.map((rec) => (
                        <div key={rec.localId} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-800">{rec.datosAgricultor.nombre}</p>
                                    <p className="text-sm text-gray-500">DNI: {rec.datosAgricultor.dni}</p>
                                    <p className="text-sm text-gray-500">Fecha: {new Date(rec.fecha).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className="font-mono text-sm text-gray-500">Hoja N°</p>
                                    <p className="font-mono font-bold text-lg text-green-700">{rec.noHoja}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${estadoStyles[rec.estado] || 'bg-gray-100'}`}>
                                    {rec.estado}
                                </span>
                                <div className="flex gap-2">
                                    <Link to={`/recommendations/${rec.localId}`} className="btn-action bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full h-9 w-9 flex items-center justify-center">👁️</Link>
                                    <Link to={`/recommendations/${rec.localId}/follow-up`} className="btn-action bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full h-9 w-9 flex items-center justify-center">📸</Link>
                                    <button onClick={() => handleDelete(rec.localId, rec.datosAgricultor.nombre)} className="btn-action bg-red-600 hover:bg-red-700 text-white p-2 rounded-full h-9 w-9 flex items-center justify-center">🗑️</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow">
                            <div className="text-4xl mb-2">📋</div>
                            <h3 className="font-bold text-lg">No se encontraron recomendaciones</h3>
                            <p>Prueba ajustando los filtros o crea una nueva recomendación.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}