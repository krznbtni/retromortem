import type PocketBase from 'pocketbase';

declare global {
  namespace App {
    interface Locals {
      pb: PocketBase;
    }

    // interface Error {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
