import { useEffect, useRef, useState } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { Button } from './ui.jsx';

/**
 * Full-screen camera capture modal.
 * onCapture(file) is called with a File (image/jpeg) once the user confirms
 * the photo. onClose() is called when the user cancels.
 */
export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not available in this browser.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch (err) {
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow camera access and try again.'
            : `Could not start the camera (${err.message}).`
        );
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.92));
  };

  const handleRetake = () => setPhotoDataUrl(null);

  const handleUsePhoto = () => {
    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `evidence-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="font-medium text-sm flex items-center gap-2">
          <Camera size={16} />
          Capture product photo
        </p>
        <button onClick={onClose} aria-label="Close camera">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <p className="text-white text-sm px-6 text-center">{error}</p>
        ) : photoDataUrl ? (
          <img src={photoDataUrl} alt="Captured preview" className="max-h-full max-w-full object-contain" />
        ) : (
          <video ref={videoRef} className="max-h-full max-w-full object-contain" playsInline muted />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="px-4 py-5 flex items-center justify-center gap-4">
        {error ? (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        ) : photoDataUrl ? (
          <>
            <Button variant="secondary" onClick={handleRetake}>
              <RotateCcw size={16} />
              Retake
            </Button>
            <Button onClick={handleUsePhoto}>
              <Check size={16} />
              Use photo
            </Button>
          </>
        ) : (
          <button
            onClick={handleCapture}
            disabled={!ready}
            aria-label="Capture photo"
            className="h-16 w-16 rounded-full border-4 border-white bg-white/20 disabled:opacity-40 active:scale-95 transition-transform"
          />
        )}
      </div>
    </div>
  );
}
