
import React, { useEffect } from 'react';
import { GenerationResult } from '../types';

interface Step4Props {
  result: GenerationResult;
  onReset: () => void;
}

const Step4Result: React.FC<Step4Props> = ({ result, onReset }) => {
  
  // Play jingle on mount
  useEffect(() => {
    // A simple public domain magical chime sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play blocked", e));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border-4 border-double border-red-200 max-w-2xl mx-auto text-center relative">
        {/* Decorative corner holly */}
        <div className="absolute top-4 right-4 text-4xl select-none">🎄</div>
        <div className="absolute top-4 left-4 text-4xl select-none">🎅</div>

        <div className="mb-6">
          <h2 className="text-4xl font-bold text-red-700 festive-font mb-3">Onnittelut!</h2>
          <p className="text-gray-600 text-lg">Virallinen joulutodistuksesi on valmis.</p>
        </div>

        {/* Badge Notification */}
        {result.badgeStatus === 'error' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center justify-center gap-4 text-yellow-800">
            <span className="text-3xl">⚠️</span>
            <div className="text-left">
              <p className="font-bold text-lg">Huomio</p>
              <p className="text-sm">PDF on luotu, mutta osaamismerkin lähetys epäonnistui.</p>
            </div>
          </div>
        )}

        {result.badgeStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center justify-center gap-4 text-green-800">
            <img src={result.badgeImageUrl} alt="Badge" className="w-12 h-12 object-contain drop-shadow-sm" />
            <div className="text-left">
              <p className="font-bold text-lg">Osaamismerkki myönnetty!</p>
              <p className="text-sm">"Jouluosaaja" -merkki on lähetetty sähköpostiisi.</p>
            </div>
          </div>
        )}
        
        {/* Skipped state: Don't show anything or maybe a subtle note? We choose to hide for cleaner UI unless requested. */}

        <div className="mb-8 relative inline-block group">
          <img 
            src={result.elfImageDataUrl} 
            alt="Elf Portrait" 
            className="rounded-2xl shadow-xl w-72 h-72 object-cover mx-auto border-4 border-green-600 transition transform group-hover:scale-105"
          />
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold px-6 py-2 rounded-full shadow-lg border-2 border-yellow-200 whitespace-nowrap z-10">
             {result.level}
          </div>
        </div>

        <div className="bg-red-50 p-8 rounded-2xl mb-10 text-left border border-red-100 mt-6 relative">
           <div className="absolute -top-3 left-6 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
             RAPORTTI
           </div>
           
           {/* Summary Line */}
           <p className="font-bold text-red-800 mb-4 text-lg border-b border-red-200 pb-2">
             {result.elfSummary}
           </p>

           <p className="text-gray-800 italic leading-relaxed text-lg">"{result.elfText}"</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
           {result.pdfDataUri && (
             <a 
               href={result.pdfDataUri} 
               download={`joulutodistus.pdf`}
               className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-green-700 hover:shadow-xl transition flex items-center justify-center gap-3 text-lg"
             >
               <span>📄</span> Lataa PDF
             </a>
           )}
           
           <button
             onClick={onReset}
             className="bg-gray-100 text-gray-700 border border-gray-300 px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition text-lg"
           >
             Aloita alusta
           </button>
        </div>
      </div>
    </div>
  );
};

export default Step4Result;
