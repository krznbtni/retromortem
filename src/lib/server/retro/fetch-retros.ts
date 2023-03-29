import {error} from '@sveltejs/kit';

import {ClientResponseError} from 'pocketbase';

import {serializeNonPOJOs} from '$lib/serialize-non-pojos';
import {Collections, type RetrospectiveResponse} from '$lib/types/pocketbase-types';

export async function fetchRetros(
  locals: App.Locals,
  filter = '',
): Promise<RetrospectiveResponse[]> {
  try {
    const retros = await locals.pb
      .collection(Collections.Retrospective)
      .getFullList<RetrospectiveResponse>(undefined, {sort: '-created', filter});

    return serializeNonPOJOs(retros);
  } catch (err) {
    console.error('fetchRetros -> Error:', err);

    if (err instanceof ClientResponseError && typeof err.data['message'] === 'string') {
      throw error(err.status, err.data['message']);
    } else {
      throw error(500, 'Something went wrong with fetching the projects.');
    }
  }
}
