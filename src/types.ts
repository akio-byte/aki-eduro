export interface UserData {
  name: string;
  email: string; // Can be empty string now
  gameScore: number;
  photoDataUrl: string | null;
}

export interface GenerationResult {
  score: number;
  level: string; // Uses the new specific titles
  elfSummary: string; // One sentence summary
  elfText: string; // The longer AI text
  elfImageDataUrl: string;
  badgeImageUrl: string;
  pdfDataUri?: string;
  badgeStatus: 'success' | 'error' | 'skipped';
}

export enum Step {
  FORM = 1,
  CAMERA = 2,
  CONFIRM = 3,
  RESULT = 4
}