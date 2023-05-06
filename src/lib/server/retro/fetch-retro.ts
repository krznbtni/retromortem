import {error} from '@sveltejs/kit';

import {ClientResponseError} from 'pocketbase';

import {serializeNonPOJOs} from '$lib/serialize-non-pojos';
import {
  Collections,
  type CollectionResponses,
  type RetrospectivesResponse,
  type UsersResponse,
} from '$lib/types/pocketbase-types';

type X = RetrospectivesResponse<{organizers: UsersResponse[]; attendees: UsersResponse[]}>;

export async function fetchRetro<T = CollectionResponses['retrospectives']>(
  locals: App.Locals,
  id: string,
  expand = 'organizers,attendees,questions.answers.votes.user',
): Promise<T> {
  try {
    const retro = await locals.pb.collection(Collections.Retrospectives).getOne<T>(id, {expand});
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
