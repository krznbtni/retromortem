import {error} from '@sveltejs/kit';

import {ClientResponseError} from 'pocketbase';

import {serializeNonPOJOs} from '$lib/serialize-non-pojos';
import type {Retro} from '$lib/types/retro';

export async function fetchRetros(locals: App.Locals, filter = ''): Promise<Retro[]> {
  try {
    const retros = await locals.pb
      .collection('retrospectives')
      .getFullList<Retro>(undefined, {sort: '-created', filter});
    return serializeNonPOJOs(retros);
  } catch (err) {
    console.log('fetchRetros -> Error:', err);

    if (err instanceof ClientResponseError && typeof err.data['message'] === 'string') {
      throw error(err.status, err.data['message']);
    } else {
      throw error(500, 'Something went wrong with fetching the projects.');
    }
  }
}
