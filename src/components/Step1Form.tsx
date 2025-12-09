import React, { useState } from 'react';
import { UserData } from '../types';

interface Step1Props {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  onNext: () => void;
}

const Step1Form: React.FC<Step1Props> = ({ userData, setUserData, onNext }) => {
  const [q1, setQ1] = useState<string>('');
  const [q2, setQ2] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  // Email is now optional
  const isFormValid = userData.name.trim().length > 0 && 
                      q1 !== '' && 
                      q2 !== '';

  const startMagicScan = () => {
    setIsScanning(true);

    // Generate a random score between 6 and 12 to allow for different titles
    // 6-8: Intermediate (Tiimi)
    // 9-12: Expert (Super)
    const magicScore = Math.floor(Math.random() * 7) + 6; 

    setTimeout(() => {
      setUserData(prev => ({ ...prev, gameScore: magicScore }));
      setIsScanning(false);
      onNext();
    }, 3000); 
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* SCANNING OVERLAY */}
      {isScanning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-64 h-64 border-4 border-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.5)] bg-black/50 overflow-hidden">
             {/* Radar Sweep Animation */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/30 to-transparent w-full h-full animate-[spin_2s_linear_infinite]" style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0)' }}></div>
             <div className="absolute inset-0 border-[1px] border-green-500/30 rounded-full animate-ping"></div>
             <div className="text-6xl animate-bounce">🎅</div>
          </div>
          <h2 className="text-3xl font-bold text-green-400 mt-8 festive-font tracking-wider animate-pulse">
            Tonttututka analysoi...
          </h2>
          <p className="text-green-200 mt-2">Mitataan joulumielen tasoa...</p>
        </div>
      )}

      {/* 1. Details Form */}
      <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-red-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
        <h2 className="text-3xl font-bold text-red-700 mb-6 festive-font border-b pb-2 border-red-100">1. Omat tiedot</h2>
        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Nimi *</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition text-lg text-gray-900 bg-gray-50"
              placeholder="Tonttu Torvinen"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Sähköposti (vapaaehtoinen)</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition text-lg text-gray-900 bg-gray-50"
              placeholder="tonttu@eduro.fi"
            />
            <p className="text-xs text-gray-500 mt-1">Jos jätät tyhjäksi, et saa sähköistä osaamismerkkiä.</p>
          </div>
        </div>
      </div>

      {/* 2. Magic Questions */}
      <div className={`bg-white p-8 rounded-3xl shadow-2xl border-2 border-blue-100 relative overflow-hidden transition-all duration-500`}>
        <div className="absolute top-0 left-0 w-24 h-24 bg-blue-50 rounded-br-full -ml-4 -mt-4 opacity-50 pointer-events-none"></div>

        <div className="mb-6 border-b pb-2 border-blue-100">
          <h2 className="text-3xl font-bold text-blue-800 festive-font">2. Tonttututka</h2>
          <p className="text-gray-600 mt-1">Vastaa rehellisesti, jotta taika toimii!</p>
        </div>

        <div className="space-y-8">
          {/* Question 1 */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Mikä on tärkeintä joulussa?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Lahjat 🎁', 'Ruoka 🍖', 'Yhdessäolo ❤️'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setQ1(opt)}
                  className={`py-3 px-4 rounded-xl border-2 font-bold transition-all transform ${
                    q1 === opt 
                      ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-lg' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2 */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Mitä tontut tekevät kesällä?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Nukkuvat 💤', 'Vakoilevat 👀', 'Syövät puuroa 🥣'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setQ2(opt)}
                  className={`py-3 px-4 rounded-xl border-2 font-bold transition-all transform ${
                    q2 === opt 
                      ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-lg' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4 pb-10">
        <button
          onClick={startMagicScan}
          disabled={!isFormValid}
          className={`px-10 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform flex items-center gap-3 ${
            isFormValid
              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 hover:scale-105 hover:shadow-2xl ring-4 ring-green-200 animate-pulse-slow' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>🔮</span> Käynnistä analyysi
        </button>
      </div>
    </div>
  );
};

export default Step1Form;