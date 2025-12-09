
export const ELF_TITLES = {
  BEGINNER: "Alkuharjoittelija-tonttu",
  INTERMEDIATE: "Tiimi-tonttu",
  EXPERT: "Super-tonttu"
};

export const getElfTitle = (score: number): string => {
  if (score >= 9) return ELF_TITLES.EXPERT;
  if (score >= 5) return ELF_TITLES.INTERMEDIATE;
  return ELF_TITLES.BEGINNER;
};

export const getElfSummary = (name: string, title: string, score: number): string => {
  const firstName = name.split(' ')[0];
  // Simple heuristic for summary text
  if (score >= 9) {
    return `Yhteenveto: ${firstName} on todellinen joulun sankari ja ehdotonta eliittiä!`;
  }
  if (score >= 5) {
    return `Yhteenveto: ${firstName} on luotettava tiimipelaaja, jota ilman paja ei pyörisi.`;
  }
  return `Yhteenveto: ${firstName} on innokas oppija, jolla on oikea asenne!`;
};
