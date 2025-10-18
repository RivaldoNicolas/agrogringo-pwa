import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import toast from 'react-hot-toast';
import trimCanvas from 'trim-canvas'; // Importamos la función directamente

/**
 * Componente para capturar una firma digital.
 * @param {object} props
 * @param {string} props.title - Título para el pad de firma (e.g., "Firma del Agricultor").
 * @param {string} [props.initialDataURL] - Una firma en formato base64 para cargarla inicialmente.
 * @param {function} props.onEnd - Callback que se ejecuta cuando se termina de firmar, pasando la firma en formato base64.
 */
export function SignaturePad({ title, initialDataURL, onEnd }) {
    const sigCanvas = useRef({});
    const [isSigned, setIsSigned] = useState(false);

    useEffect(() => {
        // Si recibimos una firma inicial y el canvas está listo, la dibujamos.
        if (initialDataURL && sigCanvas.current) {
            sigCanvas.current.fromDataURL(initialDataURL);
            setIsSigned(true);
        }
    }, [initialDataURL]);

    const clear = () => {
        sigCanvas.current.clear();
        setIsSigned(false);
        onEnd(null); // Notificar que se ha limpiado
    };

    const save = () => {
        if (sigCanvas.current.isEmpty()) {
            toast.error("Por favor, ingrese una firma para guardar.");
            return;
        }

        // --- INICIO DE LA LÓGICA DE GUARDADO ---

        // 1. Obtenemos el canvas original. Se ve nítido gracias a las clases de CSS.
        const originalCanvas = sigCanvas.current.getCanvas();

        // 2. Creamos un canvas temporal para copiar y procesar la firma.
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = originalCanvas.width;
        tempCanvas.height = originalCanvas.height;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCtx.drawImage(originalCanvas, 0, 0);

        // 3. Recortamos el canvas temporal.
        trimCanvas(tempCanvas);

        // 4. Añadimos el fondo blanco.
        tempCtx.globalCompositeOperation = 'destination-over';
        tempCtx.fillStyle = '#FFFFFF'; // Blanco
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // 5. Exportamos la imagen final como PNG y la enviamos.
        const dataUrlWithBackground = tempCanvas.toDataURL('image/png');
        onEnd(dataUrlWithBackground);
        setIsSigned(true);
        toast.success("Firma guardada.");
        // --- FIN DE LA LÓGICA DE GUARDADO ---
    };

    return (
        <div className="p-4 text-center border-2 border-dashed rounded-lg bg-white">
            <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>
            <div className="bg-gray-100 border rounded-md">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor='black'
                    canvasProps={{ className: 'w-full h-32 rounded-md' }}
                    onEnd={() => setIsSigned(true)} // Solo actualizamos el estado para saber que hay algo dibujado
                />
            </div>
            <div className="flex justify-center gap-2 mt-2">
                <button type="button" onClick={clear} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded">
                    Limpiar
                </button>
                {/* Ahora el guardado es explícito con este botón */}
                <button type="button" onClick={save} className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">
                    Guardar Firma
                </button>
            </div>
        </div>
    );
}