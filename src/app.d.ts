import type PocketBase from 'pocketbase';
import type {User} from '$lib/types/user';

declare global {
  namespace App {
    interface Locals {
      pb: PocketBase;
      user?: User;
    }

    // interface Error {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
