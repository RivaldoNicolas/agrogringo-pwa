import { useState, useEffect, useRef } from 'react';
import { getAllRecommendations, deleteRecommendation } from '@/services/api/recommendations';
import { useAuth } from '@/hooks/useAuth'; // Asegúrate de que la ruta sea correcta
import toast from 'react-hot-toast';
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/solid'; // Necesitarás instalar @heroicons/react
import { Link } from 'react-router-dom';
import { exportElementAsPdf } from '@/services/exportPdf.js';
import { RecommendationPdfLayout } from '../components/RecommendationPdfLayout';
import logo from '@/assets/logo_agrogringo.jpeg'; // Importamos el logo
import { exportToExcel } from '@/services/excelExporter'; // ¡Importamos el nuevo exportador!

export function ConsultationPage() {
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const initialLoadDone = useRef(false); // 1. Añadimos una referencia para controlar la carga inicial.

    // NUEVO: id de la recomendación seleccionada para exportar
    const [selectedRecId, setSelectedRecId] = useState(null);
    const pdfLayoutRef = useRef(null); // Ref para el componente del PDF/Imagen

    // Estados para los filtros
    const [clientFilter, setClientFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false); // Estado para mostrar/ocultar filtros en móvil

    // Estados para paginación
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Estilos para los estados, para mantener consistencia
    const estadoStyles = {
        'Pendiente': 'bg-yellow-100 text-yellow-800',
        'En tratamiento': 'bg-blue-100 text-blue-800',
        'Finalizado': 'bg-green-100 text-green-800',
    };

    const fetchRecommendations = async (currentPage, currentFilters, loadMore = false) => {
        if (!user) return;

        if (loadMore) {
            setIsLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const { data, total } = await getAllRecommendations(user.uid, currentPage, 15, currentFilters);

            if (loadMore) {
                setFilteredData(prevData => [...prevData, ...data]);
            } else {
                setFilteredData(data);
                setTotalCount(total);
            }

            setHasMore(currentPage * 15 < total);

        } catch (err) {
            setError('No se pudieron cargar las recomendaciones.');
            console.error(err);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        // 2. Usamos la referencia para asegurarnos de que la carga inicial solo se ejecute una vez.
        // Esto soluciona el problema del doble `useEffect` en StrictMode.
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            // Carga inicial
            fetchRecommendations(1, {});
        }
    }, [user]);

    const applyFilters = () => {
        setPage(1); // Reseteamos la página a 1
        const filters = { client: clientFilter, status: statusFilter, dateFrom: dateFromFilter, dateTo: dateToFilter };
        fetchRecommendations(1, filters);
    };

    const clearFilters = () => {
        setClientFilter('');
        setStatusFilter('');
        setDateFromFilter('');
        setDateToFilter('');
        setPage(1);
        fetchRecommendations(1, {}); // Volvemos a cargar sin filtros
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        const filters = { client: clientFilter, status: statusFilter, dateFrom: dateFromFilter, dateTo: dateToFilter };
        fetchRecommendations(nextPage, filters, true);
    };

    const handleDelete = async (id, nombreCliente) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la recomendación para "${nombreCliente}"? Esta acción no se puede deshacer.`)) {
            try {
                await deleteRecommendation(id);
                // Actualizar el estado para reflejar la eliminación en la UI
                setFilteredData(prev => prev.filter(rec => rec.id !== id));
                setTotalCount(prev => prev - 1);
                // Si se eliminó la recomendación seleccionada, limpiar selección
                if (selectedRecId === id) setSelectedRecId(null);
                toast.success('Recomendación eliminada con éxito.');
            } catch (err) {
                toast.error('Error al eliminar la recomendación.');
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

    // NUEVO: exportar la recomendación seleccionada desde el header
    const handleExportSelected = async () => {
        if (!selectedRecId) {
            toast.error('Selecciona una recomendación para exportar.');
            return;
        }
        if (!pdfLayoutRef.current) {
            toast.error('El contenido para exportar no está listo. Intenta de nuevo.');
            return;
        }

        const rec = filteredData.find(r => r.id === selectedRecId);
        const baseFileName = `recomendacion-${rec.noHoja || rec.localId || Date.now()}`;

        try {
            const t = toast.loading('Generando PDF...');
            await exportElementAsPdf(pdfLayoutRef.current, `${baseFileName}.pdf`);
            toast.dismiss(t);
            toast.success('PDF descargado con éxito.');
        } catch (err) {
            toast.error('Error al generar el PDF.');
            console.error(err);
        }
    };

    // NUEVO: exportar los datos filtrados a Excel
    const handleExportExcel = () => {
        if (filteredData.length === 0) {
            toast.error('No hay datos para exportar a Excel.');
            return;
        }
        try {
            const t = toast.loading('Generando archivo Excel...');
            exportToExcel(filteredData); // Llamamos a la función con los datos actuales
            toast.dismiss(t);
            toast.success('Excel exportado con éxito.');
        } catch (err) {
            toast.error('Hubo un error al generar el archivo Excel.');
            console.error(err);
        }
    };

    if (loading) return <p className="p-4 text-center">Cargando recomendaciones...</p>;
    if (error) return <p className="p-4 text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Renderizar el layout del PDF/Imagen fuera de la pantalla */}
            {/* Solo se renderiza si hay una recomendación seleccionada */}
            {selectedRecId && (
                <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
                    <div ref={pdfLayoutRef}>
                        <RecommendationPdfLayout
                            recommendation={filteredData.find(r => r.id === selectedRecId)}
                        />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* HEADER DE LA PÁGINA */}
                <div className="bg-gradient-to-r from-green-800 to-green-600 text-white p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 sm:mb-0">                            <img src={logo} alt="Logo AgroGringo" className="h-12 w-12 mr-4 rounded-full object-cover" />
                            <div>
                                <h1 className="text-2xl font-bold">Consulta de Recomendaciones</h1>
                                <p className="text-sm opacity-90">Gestión y Seguimiento</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportExcel}
                                className="btn-export bg-white/20 border-white/30 hover:bg-white/30 border-2 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                            >
                                📊 Excel
                            </button>
                            <button
                                onClick={handleExportSelected}
                                disabled={!selectedRecId}
                                className="btn-export bg-white/20 border-white/30 hover:bg-white/30 border-2 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        Mostrando <strong>{filteredData.length}</strong> de <strong>{totalCount}</strong>
                    </div>
                </div>

                {/* VISTA DE TABLA (para pantallas grandes) */}
                <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-gray-100">
                            <tr className="text-left text-gray-600"><th className="p-3 font-semibold">Sel</th><th className="p-3 font-semibold">N° Hoja</th><th className="p-3 font-semibold">Fecha</th><th className="p-3 font-semibold">Cliente</th><th className="p-3 font-semibold">Estado</th><th className="p-3 font-semibold text-center">Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map((rec) => (
                                <tr key={rec.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <input
                                            type="radio"
                                            name="selectedRec"
                                            checked={selectedRecId === rec.id}
                                            onChange={() => setSelectedRecId(rec.id)}
                                        />
                                    </td>
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
                                        <Link to={`/recommendations/${rec.id}`} className="btn-action bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded flex items-center gap-1">👁️ Ver</Link>
                                        <Link to={`/recommendations/${rec.id}/follow-up`} className="btn-action bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded flex items-center gap-1">📸 Seguir</Link>
                                        <Link to={`/recommendations/edit/${rec.id}`} className="btn-action bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded flex items-center gap-1">✏️ Edit</Link>
                                        <button onClick={() => handleDelete(rec.id, rec.datosAgricultor.nombre)} className="btn-action bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded flex items-center gap-1">🗑️ Eliminar</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center p-8 text-gray-500">
                                    <div className="text-4xl mb-2">📋</div>
                                    <h3 className="font-bold text-lg">No se encontraron recomendaciones</h3>
                                    <p>Prueba ajustando los filtros o crea una nueva recomendación.</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* VISTA DE TARJETAS (para pantallas pequeñas) */}
                <div className="lg:hidden space-y-4">
                    {filteredData.length > 0 ? filteredData.map((rec) => (
                        <div key={rec.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
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
                                <div className="flex gap-2 items-center">
                                    {/* selección en móvil */}
                                    <input type="radio" name="selectedRecMobile" checked={selectedRecId === rec.id} onChange={() => setSelectedRecId(rec.id)} />
                                    <Link to={`/recommendations/${rec.id}`} className="btn-action bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full h-9 w-9 flex items-center justify-center">👁️</Link>
                                    <Link to={`/recommendations/edit/${rec.id}`} className="btn-action bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full h-9 w-9 flex items-center justify-center">✏️</Link>
                                    <Link to={`/recommendations/${rec.id}/follow-up`} className="btn-action bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full h-9 w-9 flex items-center justify-center">📸</Link>
                                    <button onClick={() => handleDelete(rec.id, rec.datosAgricultor.nombre)} className="btn-action bg-red-600 hover:bg-red-700 text-white p-2 rounded-full h-9 w-9 flex items-center justify-center">🗑️</button>
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

                {/* BOTÓN CARGAR MÁS */}
                {hasMore && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={loadMore}
                            disabled={isLoadingMore}
                            className="bg-white text-green-700 font-bold py-2 px-6 rounded-full border-2 border-green-700 hover:bg-green-700 hover:text-white transition disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300"
                        >
                            {isLoadingMore ? 'Cargando...' : 'Cargar Más'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}