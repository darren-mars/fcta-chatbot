// src/types/index.ts

export interface Selection {
  type: string;
  selectedKeywords?: string[];
  freeText: string;
}

export interface UserSelections {
  vibes: Selection[];
  season: Selection[];
  accommodation: Selection[];
  activities: Selection[];
}
