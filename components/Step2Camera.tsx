import React, { useRef, useState, useEffect } from 'react';
import { UserData } from '../types';

interface Step2Props {
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  onNext: () => void;
  onBack: () => void;
}

const Step2Camera: React.FC<Step2Props> = ({ setUserData, onNext, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      setCapturedImage(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError('Kameraa ei voitu käynnistää. Tarkista käyttöoikeudet.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally for mirror effect natural feel
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        setUserData(prev => ({ ...prev, photoDataUrl: dataUrl }));
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setUserData(prev => ({ ...prev, photoDataUrl: null }));
    startCamera();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-blue-100 text-center relative overflow-hidden">
        <h2 className="text-3xl font-bold text-blue-800 mb-4 festive-font">3. Ota kuva</h2>
        <p className="mb-6 text-gray-600 text-lg">Hymyile! Tekoäly lisää sinulle tonttulakin ja jouluisen taustan.</p>
        
        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4 font-semibold">{error}</div>
        ) : (
          <div className="relative mx-auto max-w-lg aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-100">
             {!capturedImage ? (
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 className="w-full h-full object-cover transform -scale-x-100" // Mirror live preview
               />
             ) : (
               <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
             )}
             <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          {!capturedImage ? (
            <button
              onClick={takePhoto}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition transform flex items-center gap-3"
            >
              <span className="text-2xl">📸</span> Ota kuva
            </button>
          ) : (
            <button
              onClick={retake}
              className="bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded-full font-bold shadow hover:bg-gray-200 transition"
            >
              Ota uudelleen
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 pb-10">
        <button
          onClick={onBack}
          className="text-white/80 px-6 py-2 rounded-lg hover:bg-white/10 transition font-semibold"
        >
          &larr; Takaisin
        </button>
        <button
          onClick={onNext}
          disabled={!capturedImage}
          className={`px-10 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform ${
            capturedImage
              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 hover:scale-105 hover:shadow-2xl ring-4 ring-red-200' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Jatka vahvistukseen &rarr;
        </button>
      </div>
    </div>
  );
};

export default Step2Camera;