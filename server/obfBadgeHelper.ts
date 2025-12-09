export interface IssueBadgePayload {
  email: string;
  firstName: string;
}

export async function issueObfBadge(payload: IssueBadgePayload): Promise<{ success: boolean; error?: string; }> {
  const { email, firstName } = payload;

  const OBF_CLIENT_ID = process.env.OBF_CLIENT_ID;
  const OBF_CLIENT_SECRET = process.env.OBF_CLIENT_SECRET;
  const OBF_BADGE_ID = process.env.OBF_BADGE_ID;
  const OBF_API_BASE = process.env.OBF_API_BASE || 'https://openbadgefactory.com';
  const OBF_BADGE_NAME = process.env.OBF_BADGE_NAME || 'Joulun osaaja';

  if (!email || !firstName) {
    return { success: false, error: "Missing email or firstName" };
  }

  if (!OBF_CLIENT_ID || !OBF_CLIENT_SECRET || !OBF_BADGE_ID) {
    console.error("OBF env vars missing", { OBF_CLIENT_ID: !!OBF_CLIENT_ID, OBF_CLIENT_SECRET: !!OBF_CLIENT_SECRET, OBF_BADGE_ID: !!OBF_BADGE_ID });
    return { success: false, error: "Server misconfiguration: OBF env vars missing" };
  }

  try {
    // 1) Hae token OBF:lta
    const tokenUrl = `${OBF_API_BASE}/oauth/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', OBF_CLIENT_ID);
    params.append('client_secret', OBF_CLIENT_SECRET);

    const authRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!authRes.ok) {
      throw new Error(`OBF Auth Failed: ${authRes.status} ${authRes.statusText}`);
    }

    const authData: any = await authRes.json();
    const token = authData.access_token;

    // 2) Kutsu badge issue -endpointtia
    const issueUrl = `${OBF_API_BASE}/v2/badge/${OBF_BADGE_ID}/assertion`;
    const emailBody = `Hei ${firstName}!\n\nOnnittelut, olet suorittanut Joulun Osaaja -kioskin tonttutestin.\nLiitteenä on digitaalinen osaamismerkkisi: "${OBF_BADGE_NAME}".\n\nHauskaa joulua!`;

    const issuePayload = {
      recipient: [email],
      email_subject: `Sinulle on myönnetty ${OBF_BADGE_NAME} -merkki!`,
      email_body: emailBody,
      email_footer: "Terveisin, Eduro Pikkujoulukioski",
    };

    const issueRes = await fetch(issueUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(issuePayload)
    });

    if (!issueRes.ok) {
      const errText = await issueRes.text();
      console.error("OBF Issue Error", issueRes.status, errText);
      return { success: false, error: `OBF Refused: ${errText}` };
    }

    return { success: true };

  } catch (error: any) {
    console.error("OBF Process Error:", error);
    return { success: false, error: error.message };
  }
}
