/**
 * Issues the "Jouluosaaja" badge to the user's email via the Vercel backend.
 */
export const issueBadgeToUser = async (
  email: string, 
  firstName: string, 
  level: string, 
  score: number
): Promise<boolean> => {
  try {
    const response = await fetch('/api/send-badge-email', {
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
      console.error("Backend refused badge issuance");
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
  return "https://cdn-icons-png.flaticon.com/512/6192/6192737.png"; 
};