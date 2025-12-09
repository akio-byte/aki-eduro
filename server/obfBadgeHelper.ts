// server/obfBadgeHelper.ts
import "dotenv/config";

export interface IssueBadgePayload {
  email: string;
  firstName: string;
}

/**
 * Yhteinen helperi OBF-osaamismerkin myöntämiseen.
 * Käytetään sekä local Express-serverissä että Vercel-funktiossa.
 */
export async function issueObfBadge(
  payload: IssueBadgePayload
): Promise<{ success: boolean; error?: string }> {
  const { email, firstName } = payload;

  const OBF_CLIENT_ID = process.env.OBF_CLIENT_ID;
  const OBF_CLIENT_SECRET = process.env.OBF_CLIENT_SECRET;
  const OBF_BADGE_ID = process.env.OBF_BADGE_ID;
  const OBF_API_BASE = process.env.OBF_API_BASE || "https://openbadgefactory.com";
  const OBF_BADGE_NAME = process.env.OBF_BADGE_NAME || "Joulun osaaja";

  if (!email || !firstName) {
    return { success: false, error: "Missing email or firstName" };
  }

  if (!OBF_CLIENT_ID || !OBF_CLIENT_SECRET || !OBF_BADGE_ID) {
    console.error("OBF env vars missing", {
      OBF_CLIENT_ID: !!OBF_CLIENT_ID,
      OBF_CLIENT_SECRET: !!OBF_CLIENT_SECRET,
      OBF_BADGE_ID: !!OBF_BADGE_ID,
    });
    return {
      success: false,
      error: "Server misconfiguration: OBF credentials missing",
    };
  }

  try {
    // 1) Hae access token OBF:lta (client credentials -flow)
    const tokenUrl = `${OBF_API_BASE}/oauth/token`;
    const tokenBody = new URLSearchParams();
    tokenBody.append("grant_type", "client_credentials");
    tokenBody.append("client_id", OBF_CLIENT_ID);
    tokenBody.append("client_secret", OBF_CLIENT_SECRET);

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenBody,
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("OBF token error:", tokenRes.status, errText);
      return { success: false, error: "Failed to get OBF access token" };
    }

    const tokenJson: any = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) {
      console.error("OBF token missing access_token:", tokenJson);
      return {
        success: false,
        error: "OBF token response missing access_token",
      };
    }

    // 2) Myönnä badge
    // HUOM: tarkka endpoint voi vaihdella OBF-konfiguraation mukaan – tarvittaessa muokkaa tätä
    const issueUrl = `${OBF_API_BASE}/v1/issuer/issuances`;
    const issueBody = {
      email,
      firstName,
      badgeId: OBF_BADGE_ID,
      badgeName: OBF_BADGE_NAME,
    };

    const issueRes = await fetch(issueUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(issueBody),
    });

    if (!issueRes.ok) {
      const errText = await issueRes.text();
      console.error("OBF issue error:", issueRes.status, errText);
      return {
        success: false,
        error: "Failed to issue badge on OBF side",
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("OBF badge helper error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
