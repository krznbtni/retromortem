import {error} from '@sveltejs/kit';

import {ClientResponseError} from 'pocketbase';

import {serializeNonPOJOs} from '$lib/serialize-non-pojos';
import type {Retro} from '$lib/types/retro';

export async function fetchRetro(locals: App.Locals, id: string): Promise<Retro> {
  try {
    const retro = await locals.pb.collection('retrospectives').getOne<Retro>(id);
    return serializeNonPOJOs(retro);
  } catch (err) {
    console.log('fetchRetro -> Error:', err);

    if (err instanceof ClientResponseError && typeof err.data['message'] === 'string') {
      throw error(err.status, err.data['message']);
    } else {
      throw error(500, 'Something went wrong with fetching the retro.');
    }
  }
}
