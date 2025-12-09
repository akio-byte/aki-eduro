# 🎄 Joulun Osaaja -kioski

Tämä sovellus on "pikkujoulukioski", joka toimii Vercelissä ja hyödyntää tekoälyä.

## 🛠 Teknologiat

-   **Frontend**: React (Vite), TypeScript
-   **Backend**: Vercel Serverless Functions / Node.js (Express paikallisesti)
-   **AI**: Google Gemini / OpenRouter
-   **Merkit**: Open Badge Factory

## 🚀 Kehittäjälle

### 1. Ympäristömuuttujat

Kopioi `.env.example` tiedostoon `.env` ja täytä omilla avaimillasi:

```bash
cp .env.example .env
```

Tarvitset:
- `GEMINI_API_KEY` tai `OPENROUTER_API_KEY` kuvien luontiin.
- `OBF_CLIENT_ID`, `OBF_CLIENT_SECRET` ja `OBF_BADGE_ID` osaamismerkkien myöntämiseen.

### 2. Paikallinen ajo (Hybrid)

Tämä projekti käyttää Viten proxyä ohjaamaan `/api`-kutsut paikalliseen Express-palvelimeen kehityksen aikana.

```bash
# 1. Asenna riippuvuudet
npm install

# 2. Käynnistä backend (kuuntelee porttia 3001)
npm run server

# 3. Käynnistä frontend (toisessa terminaalissa)
npm run dev
```

Avaa selaimella: http://localhost:5173

### 3. Vercel-deploy

Tämä repo on valmis Vercel-deployhin.

1. Importoi repo Verceliin.
2. Valitse Framework Preset: **Vite**.
3. Varmista asetukset:
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
4. Aseta **Environment Variables** (Project Settings):
    - Lisää samat muuttujat kuin `.env.example`:ssa (paitsi PORT ja VITE_APP_NAME ovat valinnaisia).
    - Tärkeää: API-avaimet (`GEMINI_API_KEY`, `OBF_...`) asetetaan tänne, jotta serverless-funktiot toimivat.

### Huomio tietoturvasta
Frontend ei sisällä API-avaimia. Kaikki sensitiiviset kutsut (kuvagenerointi, badget) kulkevat `/api`-rajapinnan kautta, joka pyörii palvelimella (Vercel Functions tai local Express).
