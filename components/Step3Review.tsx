
import React, { useState } from 'react';
import { UserData, GenerationResult } from '../types';
import { getElfTitle, getElfSummary } from '../constants';
import { generateElfDescription, transformToElfPortrait } from '../services/geminiService';
import { generateCertificatePdf } from '../services/pdfService';
import { issueBadgeToUser, getBadgeImageUrl } from '../services/openBadgeService';

interface Step3Props {
  userData: UserData;
  onBack: () => void;
  onSuccess: (result: GenerationResult) => void;
}

const Step3Review: React.FC<Step3Props> = ({ userData, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalScore = userData.gameScore;
  const level = getElfTitle(totalScore); // Changed to use new getElfTitle
  const summary = getElfSummary(userData.name, level, totalScore);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const badgeImageUrl = getBadgeImageUrl();
      
      // Determine if we should attempt badge issuance
      const shouldIssueBadge = userData.email && userData.email.trim().length > 0;
      
      // Start tasks
      const elfTextPromise = generateElfDescription(userData.name, totalScore, level);
      const elfImagePromise = userData.photoDataUrl ? transformToElfPortrait(userData.photoDataUrl) : Promise.resolve(userData.photoDataUrl || "");
      const badgePromise = shouldIssueBadge 
        ? issueBadgeToUser(userData.email, userData.name.split(' ')[0] || userData.name, level, totalScore)
        : Promise.resolve(false);

      const [elfText, elfImage, badgeSuccess] = await Promise.all([
        elfTextPromise,
        elfImagePromise,
        badgePromise
      ]);

      let badgeStatus: 'success' | 'error' | 'skipped' = 'skipped';
      if (shouldIssueBadge) {
        badgeStatus = badgeSuccess ? 'success' : 'error';
      }

      // Generate PDF
      const pdfBase64 = await generateCertificatePdf(
        userData.name,
        level,
        totalScore,
        elfText,
        summary, // Pass summary
        elfImage,
        badgeImageUrl
      );

      onSuccess({
        score: totalScore,
        level,
        elfSummary: summary,
        elfText,
        elfImageDataUrl: elfImage,
        badgeImageUrl,
        pdfDataUri: pdfBase64,
        badgeStatus
      });

    } catch (err) {
      console.error(err);
      setError("Todistuksen luonti epäonnistui. Varmista verkkoyhteys ja API-avaimet.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in space-y-8 bg-white/95 rounded-3xl shadow-2xl mx-auto max-w-lg">
        <div className="w-24 h-24 border-8 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 festive-font mb-2">Tekoälytontut töissä...</h2>
          <p className="text-gray-600 text-lg">Analysoidaan tonttutaitoja, taioitaan kuvaa ja lähetetään osaamismerkkiä.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-yellow-100">
        <h2 className="text-3xl font-bold text-yellow-700 mb-8 festive-font text-center">Vahvista tiedot</h2>
        
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
             <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nimi</span>
                <p className="text-xl font-bold text-gray-900">{userData.name}</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Sähköposti</span>
                <p className="text-xl font-medium text-gray-900">{userData.email || "Ei sähköpostia"}</p>
             </div>
             <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <span className="block text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Tulosarvio</span>
                <p className="text-2xl font-bold text-green-700 festive-font">{level}</p>
             </div>
          </div>
          
          <div className="text-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Valittu kuva</p>
            {userData.photoDataUrl && (
              <img src={userData.photoDataUrl} alt="Selfie" className="mx-auto rounded-xl shadow-lg max-h-56 object-cover" />
            )}
          </div>
        </div>

        {error && (
           <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-xl text-center font-bold border border-red-200">
             {error}
           </div>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={handleGenerate}
            className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-500 text-white text-2xl font-bold px-12 py-5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 hover:from-red-700 hover:to-red-600 transition transform ring-4 ring-red-200"
          >
            ✨ Luo todistus
          </button>
        </div>
      </div>

      <div className="text-center pb-10">
        <button onClick={onBack} className="text-white/80 hover:text-white underline font-medium">
          &larr; Palaa muokkaamaan
        </button>
      </div>
    </div>
  );
};

export default Step3Review;
