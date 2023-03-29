import {error} from '@sveltejs/kit';

import {ClientResponseError} from 'pocketbase';

import {serializeNonPOJOs} from '$lib/serialize-non-pojos';
import {Collections, type RetrospectiveResponse} from '$lib/types/pocketbase-types';

export async function fetchRetro<T = RetrospectiveResponse>(
  locals: App.Locals,
  id: string,
  expand = '',
): Promise<T> {
  try {
    const retro = await locals.pb.collection(Collections.Retrospective).getOne<T>(id, {expand});
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
