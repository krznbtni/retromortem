import {error} from '@sveltejs/kit';

import {ClientResponseError} from 'pocketbase';

import {serializeNonPOJOs} from '$lib/serialize-non-pojos';
import {Collections, type CollectionResponses} from '$lib/types/pocketbase-types';

export async function fetchRetroQuestions(
  locals: App.Locals,
  retroId: string,
): Promise<Array<CollectionResponses['questions']>> {
  try {
    const retros = await locals.pb
      .collection(Collections.Questions)
      .getFullList<CollectionResponses['questions']>(undefined, {
        filter: `retrospective = "${retroId}"`,
      });

    return serializeNonPOJOs(retros);
  } catch (err) {
    console.error('fetchRetroQuestions -> Error:', err);

    if (err instanceof ClientResponseError && typeof err.data['message'] === 'string') {
      throw error(err.status, err.data['message']);
    } else {
      throw error(500, "Something went wrong with fetching the retro's questions.");
    }
  }
}
