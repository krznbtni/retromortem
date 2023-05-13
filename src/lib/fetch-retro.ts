import {error} from '@sveltejs/kit';

import {ClientResponseError} from 'pocketbase';

import {serializeNonPOJOs} from '$lib/serialize-non-pojos';
import {Collections, type CollectionResponses} from '$lib/types/pocketbase-types';

import type PocketBase from 'pocketbase';

export async function fetchRetro<T = CollectionResponses['retrospectives']>(
  pb: PocketBase,
  id: string,
  expand = '',
): Promise<T> {
  try {
    const retro = await pb.collection(Collections.Retrospectives).getOne<T>(id, {expand});
    return serializeNonPOJOs(retro);
  } catch (err) {
    console.error('fetchRetro -> Error:', err);

    if (err instanceof ClientResponseError && typeof err.data['message'] === 'string') {
      throw error(err.status, err.data['message']);
    } else {
      throw error(500, 'Something went wrong with fetching the retro.');
    }
  }
}
