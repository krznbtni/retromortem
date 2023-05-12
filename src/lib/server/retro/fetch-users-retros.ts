import {error} from '@sveltejs/kit';

import {ClientResponseError} from 'pocketbase';

import {serializeNonPOJOs} from '$lib/serialize-non-pojos';
import {Collections, type RetrospectivesResponse} from '$lib/types/pocketbase-types';

export async function fetchUsersRetros(locals: App.Locals): Promise<RetrospectivesResponse[]> {
  if (!locals?.user) {
    console.error('fetchUsersRetros -> locals.user does not exist');
    throw error(400, 'Something went wrong updating your profile.');
  }

  try {
    const retros = await locals.pb
      .collection(Collections.Retrospectives)
      .getFullList<RetrospectivesResponse>(undefined, {
        sort: '-created',
        filter: `organizer = "${locals?.user?.id}" || attendees.id ?= "${locals?.user?.id}"`,
      });

    return serializeNonPOJOs(retros);
  } catch (err) {
    console.error('fetchUsersRetros -> Error:', err);

    if (err instanceof ClientResponseError && typeof err.data['message'] === 'string') {
      throw error(err.status, err.data['message']);
    } else {
      throw error(500, "Something went wrong with fetching the user's retros.");
    }
  }
}
