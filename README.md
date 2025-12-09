# 🎄 Joulun Osaaja -kioski

Tämä sovellus on "pikkujoulukioski", joka toimii Vercelissä ja hyödyntää tekoälyä.

## 🛠 Teknologiat

-   **Frontend**: React, Vite, TypeScript
-   **Backend**: Vercel Serverless Functions (Node.js)
-   **AI**: Google Gemini / OpenRouter
-   **Merkit**: Open Badge Factory

## 🚀 Kehitys (Paikallinen)

1. **Asenna riippuvuudet**: `npm install`
2. **Ympäristömuuttujat**:
   Luo `.env` tiedosto (`cp .env.example .env`) ja täytä avaimet.
   Huom: Paikallisessa kehityksessä backend-funktioita (`/api/*`) varten saatat tarvita `vercel dev` -komennon (`npm i -g vercel`), tai voit mockata vastaukset.
   
   Vite-dev-server yksinään ei aja `/api` kansiota serverless-funktioina ilman Vercel CLI:tä.

   Suositus: `vercel dev` käynnistää sekä frontin että funktiot.

3. **Käynnistä**:
   ```bash
   vercel dev
   # TAI pelkkä frontti (API-kutsut eivät toimi ilman proxyä)
   npm run dev
   ```

## ☁️ Deploy Verceliin

1. Lataa projekti GitHubiin.
2. Luo uusi projekti Vercelissä ja linkitä se GitHub-repoon.
3. Asetukset:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   Lisää Vercelin asetuksiin samat avaimet kuin `.env.example`:ssa:
   - `OPENROUTER_API_KEY` (tai `GEMINI_API_KEY`)
   - `OBF_CLIENT_ID`, `OBF_CLIENT_SECRET`, `OBF_BADGE_ID`
   - `VITE_SUPABASE_URL` jne. (jos käytössä)

5. Deploy!
