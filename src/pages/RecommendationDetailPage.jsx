import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecommendationById } from '@/services/api/recommendations';

export function RecommendationDetailPage() {
    const { id } = useParams();
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                setLoading(true);
                // El ID de la URL es un string, lo convertimos a número
                const data = await getRecommendationById(Number(id));
                if (data) {
                    setRecommendation(data);
                } else {
                    setError('No se encontró la recomendación.');
                }
            } catch (err) {
                setError('Error al cargar los datos de la recomendación.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRecommendation();
        }
    }, [id]);

    if (loading) return <p className="p-4 text-center">Cargando detalle de la recomendación...</p>;
    if (error) return <p className="p-4 text-center text-red-500">{error}</p>;
    if (!recommendation) return null;

    const {
        noHoja,
        fecha,
        datosAgricultor,
        datosTecnico,
        diagnostico,
        detallesProductos,
        recomendaciones,
        seguimiento, // Añadimos seguimiento para acceder a las fotos
        firmaAgricultor,
        firmaTecnico,
    } = recommendation;

    return (
        <div className="max-w-4xl p-4 mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* HEADER */}
                <div className="bg-gradient-to-r from-green-800 to-green-600 text-white p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <div className="text-5xl mr-4">🌱</div>
                            <div>
                                <h1 className="text-2xl font-bold text-shadow">DETALLE DE RECOMENDACIÓN</h1>
                                <p className="font-semibold">HOJA DE RECOMENDACIÓN TÉCNICA</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/25 px-4 py-2 rounded-full text-lg font-bold mt-1">
                                N° {noHoja}
                            </div>
                            <p className="mt-2 text-sm">Fecha: {new Date(fecha).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Datos del Agricultor */}
                    <section className="p-4 bg-gray-50 rounded-lg border">
                        <h2 className="text-lg font-bold text-green-800 mb-3">👨‍🌾 Datos del Agricultor</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <p><strong>Nombre:</strong> {datosAgricultor.nombre}</p>
                            <p><strong>DNI:</strong> {datosAgricultor.dni}</p>
                            <p className="md:col-span-2"><strong>Dirección:</strong> {datosAgricultor.direccion}</p>
                            <p><strong>Provincia:</strong> {datosAgricultor.provincia}</p>
                            <p><strong>Distrito:</strong> {datosAgricultor.distrito}</p>
                            <p><strong>Adelanto:</strong> S/ {datosAgricultor.adelanto?.toFixed(2) || '0.00'}</p>
                        </div>
                    </section>

                    {/* Datos del Técnico */}
                    <section className="p-4 bg-gray-50 rounded-lg border">
                        <h2 className="text-lg font-bold text-green-800 mb-3">🧑‍🔬 Representante Técnico</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <p><strong>Nombre:</strong> {datosTecnico.nombre}</p>
                            <p><strong>Email:</strong> {datosTecnico.email}</p>
                            <p><strong>CIP:</strong> {datosTecnico.cip || 'N/A'}</p>
                            <p><strong>Teléfono:</strong> {datosTecnico.telefono || 'N/A'}</p>
                        </div>
                    </section>

                    {/* Diagnóstico */}
                    <section className="p-4 bg-gray-50 rounded-lg border">
                        <h2 className="text-lg font-bold text-green-800 mb-3">🔬 Diagnóstico en Cultivo</h2>
                        <p className="text-sm whitespace-pre-wrap">{diagnostico}</p>
                        {seguimiento?.fotoAntes && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-sm mb-2">Foto del Cultivo (Antes):</h3>
                                <img
                                    src={seguimiento.fotoAntes}
                                    alt="Foto del cultivo antes del tratamiento"
                                    className="rounded-lg border max-w-sm mx-auto"
                                />
                            </div>
                        )}
                    </section>

                    {/* Productos Recomendados */}
                    <section className="p-4 bg-gray-50 rounded-lg border">
                        <h2 className="text-lg font-bold text-green-800 mb-3">📦 Productos Recomendados</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-2 text-left font-semibold">Producto</th>
                                        <th className="p-2 text-left font-semibold">Cantidad</th>
                                        <th className="p-2 text-left font-semibold">Forma de Uso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detallesProductos.map((p, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-2">{p.producto}</td>
                                            <td className="p-2">{p.cantidad}</td>
                                            <td className="p-2">{p.formaUso || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Recomendaciones de Seguridad */}
                    <section className="p-4 bg-green-50 rounded-lg border-green-200 border">
                        <h2 className="text-lg font-bold text-green-800 mb-3">💡 Recomendaciones de Seguridad</h2>
                        <ul className="space-y-1 list-disc list-inside text-sm">
                            {recomendaciones.filter(r => r).map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </section>

                    {/* Firmas */}
                    <section className="p-4 bg-gray-50 rounded-lg border">
                        <h2 className="text-lg font-bold text-green-800 mb-3">✍️ Firmas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-center">
                                <h3 className="font-semibold">Firma del Agricultor</h3>
                                {firmaAgricultor ? (
                                    <img
                                        src={typeof firmaAgricultor === 'object' ? firmaAgricultor.dataUrl : firmaAgricultor}
                                        alt="Firma Agricultor"
                                        className="mx-auto mt-2 bg-white border rounded"
                                    />
                                ) : (
                                    <p className="text-xs text-gray-500 mt-2">(No registrada)</p>
                                )}
                            </div>
                            <div className="text-center">
                                <h3 className="font-semibold">Firma del Técnico</h3>
                                {firmaTecnico ? (
                                    <img
                                        src={typeof firmaTecnico === 'object' ? firmaTecnico.dataUrl : firmaTecnico}
                                        alt="Firma Técnico"
                                        className="mx-auto mt-2 bg-white border rounded"
                                    />
                                ) : (
                                    <p className="text-xs text-gray-500 mt-2">(No registrada)</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Botón para volver */}
                    <div className="flex justify-center pt-4">
                        <Link
                            to="/"
                            className="btn btn-back bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
                        >
                            <span>← Volver a la Lista</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}