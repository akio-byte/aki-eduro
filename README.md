# 🎄 Joulun Osaaja -kioski

Tämä sovellus on "pikkujoulukioski", jota käytetään paikan päällä tapahtumissa. Sovellus sisältää:
1.  **Tonttumittari-pelin**: Muistipeli, joka mittaa käyttäjän "tonttutaidot".
2.  **Kameran**: Ottaa kuvan käyttäjästä.
3.  **Tekoälygeneraattorin**: Google Gemini muuttaa kuvan tontuksi ja kirjoittaa runon.
4.  **Sertifikaatin**: Luo PDF-todistuksen ja myöntää Open Badge -osaamismerkin sähköpostiin.

## 🛠 Teknologiat

-   **Frontend**: React, Vite, TypeScript, Tailwind CSS
-   **AI**: Google Gemini API (Webcam-kuvan muokkaus + tekstin generointi)
-   **PDF**: `pdf-lib` (selaimessa tapahtuva generointi)
-   **Backend**: Node.js + Express (Open Badge Factory API proxy)

## 🚀 Asennus ja käyttöönotto (Paikallinen kioski)

Koska sovellus käsittelee salaisuuksia (Open Badge Factoryn avaimet), se vaatii kevyen taustapalvelimen toimiakseen oikein.

### 1. Kloonaa repositorio
```bash
git clone <REPO_URL>
cd joulun-osaaja-kioski
```

### 2. Asenna riippuvuudet
```bash
npm install
```

### 3. Määritä ympäristömuuttujat
Kopioi mallitiedosto `.env.local`:
```bash
cp .env.example .env.local
```

Muokkaa `.env.local` -tiedostoa ja täytä avaimet:

*   **VITE_GEMINI_API_KEY**: Hae Google AI Studiosta (tarvitaan kuvanmuokkaukseen).
*   **OBF_CLIENT_ID / SECRET**: Hae Open Badge Factoryn hallintapaneelista (API-avaimet).
*   **OBF_BADGE_ID**: Sen merkin ID, joka käyttäjälle myönnetään.

### 4. Käynnistä palvelin (Backend)
Backend hoitaa tietoturvallisen liikenteen Open Badge Factoryn kanssa.
```bash
npm run server
```
*Tämä käynnistyy oletuksena porttiin 3001 (`http://localhost:3001`).*

### 5. Käynnistä sovellus (Frontend)
Avaa uusi terminaali-ikkuna ja aja:
```bash
npm run dev
```
Avaa selain osoitteessa `http://localhost:5173`.

## 🎮 Käyttöohje

1.  **Tiedot**: Asiakas syöttää nimen ja sähköpostin.
2.  **Peli**: Asiakas pelaa nopean muistipelin.
3.  **Kuva**: Asiakas ottaa kuvan itsestään.
4.  **Vahvistus**: Kun asiakas painaa "Luo todistus":
    *   AI analysoi tuloksen ja muokkaa kuvan.
    *   PDF luodaan ja on ladattavissa.
    *   Sovellus pyytää backendia lähettämään osaamismerkin sähköpostiin.

## ⚠️ Huomioitavaa
*   Tämä sovellus on tarkoitettu ajettavaksi kioskilla (esim. läppäri + webkamera).
*   **Tietoturva**: Älä koskaan committaa `.env.local` -tiedostoa Git-versiohallintaan. Backend on välttämätön, jotta OBF:n salaisuudet eivät paljastu selaimen lähdekoodissa.
