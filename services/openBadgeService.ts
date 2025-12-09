// Frontti kutsuu omaa backendiä, ei suoraan OBF:ää.
// Backendin oletusosoite kehityksessä. Tuotannossa tämä voisi olla suhteellinen polku '/api/...',
// mutta Vite-dev-serverillä ja erillisellä API-serverillä käytämme täyttä URLia tai proxyä.
const BACKEND_API_URL = 'http://localhost:3001/api/obf/issue';

/**
 * Issues the "Jouluosaaja" badge to the user's email via the local backend.
 */
export const issueBadgeToUser = async (
  email: string, 
  firstName: string, 
  level: string, 
  score: number
): Promise<boolean> => {
  try {
    console.log("Requesting badge issuance from backend...");
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        firstName,
        level,
        score
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend refused badge issuance:", errorText);
      return false;
    }

    const data = await response.json();
    return !!data.success;
  } catch (error) {
    console.error("Network error when calling backend for badge:", error);
    return false;
  }
};

/**
 * Returns the URL for the badge image used in the PDF.
 */
export const getBadgeImageUrl = (): string => {
  // Palautetaan staattinen kuva tai placeholder PDF:ää varten.
  // Koska emme hae kuvaa autentikoidusta OBF APIsta frontissa, käytämme julkista ikonia.
  return "https://cdn-icons-png.flaticon.com/512/6192/6192737.png"; 
};
