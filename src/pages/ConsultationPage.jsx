import { useState, useEffect } from 'react';
import { getAllRecommendations } from '@/services/api/recommendations';

export function ConsultationPage() {
    const [recommendations, setRecommendations] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los filtros
    const [clientFilter, setClientFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const data = await getAllRecommendations();
                setRecommendations(data);
                setFilteredData(data); // Inicialmente mostrar todos
            } catch (err) {
                setError('No se pudieron cargar las recomendaciones.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    const applyFilters = () => {
        let data = [...recommendations];

        if (clientFilter) {
            const lowerCaseFilter = clientFilter.toLowerCase();
            data = data.filter(item =>
                item.datosAgricultor.nombre.toLowerCase().includes(lowerCaseFilter) ||
                item.dniAgricultor.includes(lowerCaseFilter)
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

    if (loading) return <p className="p-4 text-center">Cargando recomendaciones...</p>;
    if (error) return <p className="p-4 text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                            <button className="btn-export bg-white/20 border-white/30 hover:bg-white/30 border-2 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                📊 Excel
                            </button>
                            <button className="btn-export bg-white/20 border-white/30 hover:bg-white/30 border-2 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                📄 PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="bg-gray-50 p-6 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                    <div className="flex justify-center gap-4 mt-4">
                        <button onClick={applyFilters} className="btn-filter bg-gradient-to-r from-green-600 to-green-800 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2">
                            🔍 Aplicar Filtros
                        </button>
                        <button onClick={clearFilters} className="btn-clear-filters bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">
                            🗑️ Limpiar
                        </button>
                    </div>
                </div>

                {/* RESULTADOS */}
                <div className="p-6">
                    <div className="results-header mb-4">
                        <div className="results-count font-semibold text-gray-600">
                            📊 Mostrando <strong>{filteredData.length}</strong> recomendaciones
                        </div>
                    </div>

                    {/* VISTA DE TABLA */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="bg-green-800 text-white">
                                    <th className="p-3 text-left">N° Hoja</th>
                                    <th className="p-3 text-left">Fecha</th>
                                    <th className="p-3 text-left">Cliente</th>
                                    <th className="p-3 text-left">Estado</th>
                                    <th className="p-3 text-left">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((rec) => (
                                        <tr key={rec.localId} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-bold text-green-700">{rec.noHoja}</td>
                                            <td className="p-3">{new Date(rec.fecha).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <div className="font-semibold">{rec.datosAgricultor.nombre}</div>
                                                <div className="text-sm text-gray-500">DNI: {rec.datosAgricultor.dni}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${rec.estado === 'Finalizado' ? 'bg-green-100 text-green-800' : rec.estado === 'En tratamiento' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {rec.estado}
                                                </span>
                                            </td>
                                            <td className="p-3 flex gap-2">
                                                <button className="btn-action bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">👁️ Ver</button>
                                                <button className="btn-action bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded">📸 Seguir</button>
                                                <button className="btn-action bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded">✏️ Edit</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
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
                </div>
            </div>
        </div>
    );
}