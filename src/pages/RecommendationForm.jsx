import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { createRecommendation } from '@/services/database/recommendations';


export function RecommendationForm() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            noHoja: '',
            datosAgricultor: { nombre: '', dni: '', direccion: '' },
            datosTecnico: {
                nombre: 'Nombre del Técnico', // Reemplazar con datos reales
                email: user?.email || '',
                uid: user?.uid || null, // <-- AÑADIR ESTA LÍNEA
            },


            diagnostico: '',
            detallesProductos: [{ producto: '', cantidad: 1, formaUso: '' }],
            estado: 'Pendiente',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'detallesProductos',
    });

    const onSubmit = async (data) => {
        try {
            await createRecommendation(data);
            alert('Recomendación guardada localmente con éxito!');
            navigate('/'); // Volver a la lista
        } catch (error) {
            alert('Hubo un error al guardar la recomendación.');
        }
    };

    return (
        <div className="max-w-4xl p-4 mx-auto">
            <h1 className="mb-6 text-3xl font-bold">Nueva Hoja de Recomendación</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Datos Generales */}
                <div className="p-4 border rounded-md">
                    <h2 className="mb-4 text-xl font-semibold">Datos Generales</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="noHoja" className="block text-sm font-medium">N° Hoja</label>
                            <input
                                id="noHoja"
                                {...register('noHoja', { required: 'El N° de hoja es obligatorio' })}
                                className="w-full p-2 mt-1 border rounded-md"
                            />
                            {errors.noHoja && <p className="mt-1 text-sm text-red-600">{errors.noHoja.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Datos del Agricultor */}
                <div className="p-4 border rounded-md">
                    <h2 className="mb-4 text-xl font-semibold">Datos del Agricultor</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="agricultorNombre" className="block text-sm font-medium">Nombre</label>
                            <input
                                id="agricultorNombre"
                                {...register('datosAgricultor.nombre', { required: 'El nombre es obligatorio' })}
                                className="w-full p-2 mt-1 border rounded-md"
                            />
                            {errors.datosAgricultor?.nombre && <p className="mt-1 text-sm text-red-600">{errors.datosAgricultor.nombre.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="agricultorDni" className="block text-sm font-medium">DNI</label>
                            <input
                                id="agricultorDni"
                                {...register('datosAgricultor.dni')}
                                className="w-full p-2 mt-1 border rounded-md"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="agricultorDireccion" className="block text-sm font-medium">Dirección</label>
                            <input
                                id="agricultorDireccion"
                                {...register('datosAgricultor.direccion')}
                                className="w-full p-2 mt-1 border rounded-md"
                            />
                        </div>
                    </div>
                </div>

                {/* Diagnóstico */}
                <div className="p-4 border rounded-md">
                    <h2 className="mb-4 text-xl font-semibold">Diagnóstico</h2>
                    <textarea
                        {...register('diagnostico', { required: 'El diagnóstico es obligatorio' })}
                        rows="4"
                        className="w-full p-2 mt-1 border rounded-md"
                    ></textarea>
                    {errors.diagnostico && <p className="mt-1 text-sm text-red-600">{errors.diagnostico.message}</p>}
                </div>

                {/* Detalles de Productos */}
                <div className="p-4 border rounded-md">
                    <h2 className="mb-4 text-xl font-semibold">Productos Recomendados</h2>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid items-start grid-cols-1 gap-4 p-3 border rounded-md md:grid-cols-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium">Producto</label>
                                    <input
                                        {...register(`detallesProductos.${index}.producto`, { required: true })}
                                        className="w-full p-2 mt-1 border rounded-md"
                                        placeholder="Nombre del producto"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Cantidad</label>
                                    <input
                                        type="number"
                                        {...register(`detallesProductos.${index}.cantidad`, { required: true, valueAsNumber: true, min: 0.1 })}
                                        className="w-full p-2 mt-1 border rounded-md"
                                    />
                                </div>
                                <div className="flex items-end h-full">
                                    <button type="button" onClick={() => remove(index)} className="px-3 py-2 text-white bg-red-600 rounded-md">
                                        Quitar
                                    </button>
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-sm font-medium">Forma de Uso</label>
                                    <textarea
                                        {...register(`detallesProductos.${index}.formaUso`)}
                                        rows="2"
                                        className="w-full p-2 mt-1 border rounded-md"
                                    ></textarea>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => append({ producto: '', cantidad: 1, formaUso: '' })}
                        className="px-4 py-2 mt-4 text-white rounded-md bg-secondary-500 hover:bg-secondary-600"
                    >
                        Añadir Producto
                    </button>
                </div>

                {/* Botón de Guardar */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 font-bold text-white rounded-md bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Recomendación'}
                    </button>
                </div>
            </form>
        </div>
    );
}