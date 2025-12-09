import React, { useState } from 'react';
import { Step, UserData, GenerationResult } from './types';
import Step1Form from './components/Step1Form';
import Step2Camera from './components/Step2Camera';
import Step3Review from './components/Step3Review';
import Step4Result from './components/Step4Result';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.FORM);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    gameScore: 0,
    photoDataUrl: null
  });
  const [result, setResult] = useState<GenerationResult | null>(null);

  const resetApp = () => {
    setUserData({ name: '', email: '', gameScore: 0, photoDataUrl: null });
    setResult(null);
    setStep(Step.FORM);
  };

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center">
      <header className="mb-10 text-center space-y-2 relative z-20">
        <h1 className="text-5xl md:text-7xl text-yellow-300 font-bold drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] festive-font tracking-wide">
          🎄 Joulun Osaaja 🎄
        </h1>
        <p className="text-2xl text-white font-semibold opacity-95 tracking-wider font-serif drop-shadow-md">
          Eduro Pikkujoulukioski
        </p>
      </header>

      <main className="w-full max-w-3xl relative z-20">
        {/* Progress Steps */}
        {step !== Step.RESULT && (
          <div className="flex justify-center mb-8 gap-6">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all border-4 shadow-lg ${
                  step >= num 
                    ? 'bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)] scale-110' 
                    : 'bg-slate-800/80 border-slate-600 text-slate-400'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="transition-all duration-300">
          {step === Step.FORM && (
            <Step1Form 
              userData={userData} 
              setUserData={setUserData} 
              onNext={() => setStep(Step.CAMERA)} 
            />
          )}
          
          {step === Step.CAMERA && (
            <Step2Camera 
              setUserData={setUserData} 
              onNext={() => setStep(Step.CONFIRM)}
              onBack={() => setStep(Step.FORM)}
            />
          )}
          
          {step === Step.CONFIRM && (
            <Step3Review 
              userData={userData}
              onBack={() => setStep(Step.CAMERA)}
              onSuccess={(res) => {
                setResult(res);
                setStep(Step.RESULT);
              }}
            />
          )}

          {step === Step.RESULT && result && (
            <Step4Result 
              result={result} 
              onReset={resetApp} 
            />
          )}
        </div>
      </main>

      <footer className="mt-16 text-center text-red-200/60 text-sm relative z-20">
        <p>© {new Date().getFullYear()} Eduro. Powered by Gemini AI.</p>
      </footer>
    </div>
  );
};

export default App;