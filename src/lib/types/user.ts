import type {Record} from 'pocketbase';

export interface User extends Record {
  name: string;
  avatar?: string;
  username: string;
}
