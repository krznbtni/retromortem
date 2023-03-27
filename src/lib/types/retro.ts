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
  inviteLink?: string;
  state: RetroState;
  id: string;
}

export interface RetroCreateRequest {
  organizer: string;
  description?: string;
  name: string;
  participants?: Array<string>;
  scheduled?: string;
  questions?: string;
  inviteLink?: string;
  state: RetroState;
}
