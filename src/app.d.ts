import type PocketBase from 'pocketbase';
import type {User} from '$lib/types/user';

declare global {
  namespace App {
    interface Locals {
      pb: PocketBase;
      user: User | undefined;
    }

    interface PageData {
      user: User | undefined;
    }

    // interface Error {}
    // interface Platform {}
  }
}

export {};
