export const enum RetroState {
  DRAFT,
  PUBLISHED,
}

export interface Retro {
  organizer: string;
  description?: string;
  name: string;
  participants?: Array<string>;
  scheduled?: string;
  questions?: Array<string>;
  inviteLink?: string;
  state: RetroState;
}
