import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { getRecommendationById, updateRecommendation } from '@/services/api/recommendations';
import { compressImage } from '@/utils/imageCompressor';
import { fileToBase64 } from '@/utils/fileUtils';
import toast from 'react-hot-toast';


export function FollowUpPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            estado: '',
            seguimiento: {
                fotoDespues: null,
                observaciones: '',
            }
        }
    });

    const estadoActual = watch('estado');

    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                setLoading(true);
                const data = await getRecommendationById(Number(id));
                if (data) {
                    setRecommendation(data);
                    // Cargar datos existentes en el formulario
                    setValue('estado', data.estado);
                    setValue('seguimiento.observaciones', data.seguimiento?.observaciones || '');
                } else {
                    setError('No se encontró la recomendación.');
                }
            } catch (err) {
                setError('Error al cargar los datos.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendation();
    }, [id, setValue]);

    const onSubmit = async (data) => {
        try {
            const updates = {
                estado: data.estado,
                seguimiento: {
                    ...recommendation.seguimiento, // Mantenemos fotoAntes y otros datos
                    observaciones: data.seguimiento.observaciones,
                }
            };

            // Procesar la imagen "fotoDespues" si se ha añadido
            if (data.seguimiento.fotoDespues && data.seguimiento.fotoDespues.length > 0) {
                const originalFile = data.seguimiento.fotoDespues[0];

                // Visualización en consola (temporal)
                console.log(`📸 Tamaño Original: ${(originalFile.size / 1024).toFixed(2)} KB`);

                const compressedBlob = await compressImage(originalFile);
                console.log(`✅ Tamaño Comprimido: ${(compressedBlob.size / 1024).toFixed(2)} KB`);

                const base64Image = await fileToBase64(compressedBlob);
                updates.seguimiento.fotoDespues = base64Image;
            }

            await updateRecommendation(Number(id), updates);
            toast.success('Seguimiento guardado con éxito.');
            navigate('/'); // Volver a la lista
        } catch (err) {
            toast.error('Error al guardar el seguimiento.');
            console.error(err);
        }
    };

    const handleStateChange = (newState) => {
        setValue('estado', newState, { shouldDirty: true });
    };

    if (loading) return <p className="p-4 text-center">Cargando...</p>;
    if (error) return <p className="p-4 text-center text-red-500">{error}</p>;
    if (!recommendation) return null;

    return (
        <div className="bg-gray-100 min-h-full">
            <div className="max-w-2xl mx-auto p-2 sm:p-4">
                <div className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white p-4 sm:p-6 rounded-t-xl shadow-lg">
                    <h1 className="text-2xl font-bold">Seguimiento de Recomendación</h1>
                    <p>Cliente: <strong>{recommendation.datosAgricultor.nombre}</strong> (Hoja N° {recommendation.noHoja})</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6 bg-white rounded-b-xl shadow-lg">
                    {/* Sección de Estado */}
                    <section className="p-4 bg-gray-50 rounded-lg border">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Estado Actual: <span className="text-primary-600">{estadoActual}</span></h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => handleStateChange('Pendiente')}
                                className={`btn-state ${estadoActual === 'Pendiente' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                            >
                                Pendiente
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStateChange('En tratamiento')}
                                className={`btn-state ${estadoActual === 'En tratamiento' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                                En Tratamiento
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStateChange('Finalizado')}
                                className={`btn-state ${estadoActual === 'Finalizado' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                            >
                                Finalizado
                            </button>
                        </div>
                    </section>

                    {/* Sección de Finalización (solo si el estado es 'Finalizado') */}
                    {estadoActual === 'Finalizado' && (
                        <section className="p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                            <h2 className="text-lg font-bold text-green-800 mb-4">Completar Tratamiento</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">📸 Foto del Cultivo (Después)</label>
                                    <input type="file" accept="image/*" {...register('seguimiento.fotoDespues')} className="w-full mt-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200" />
                                    {recommendation.seguimiento?.fotoDespues && <p className="text-xs text-gray-500 mt-1">Ya existe una foto. Subir una nueva la reemplazará.</p>}
                                </div>
                                <div>
                                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">📝 Observaciones Finales</label>
                                    <textarea
                                        id="observaciones"
                                        {...register('seguimiento.observaciones')}
                                        rows="4"
                                        className="w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                        placeholder="Resultados observados, comentarios del cliente, etc."
                                    ></textarea>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Botones de Acción */}
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-4 gap-4">
                        <Link
                            to="/"
                            className="w-full sm:w-auto text-center btn btn-back bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto btn btn-save bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar Seguimiento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
}