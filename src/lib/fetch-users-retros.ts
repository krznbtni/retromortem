import {error} from '@sveltejs/kit';

import {ClientResponseError} from 'pocketbase';
import type PocketBase from 'pocketbase';

import {serializeNonPOJOs} from '$lib/serialize-non-pojos';
import {Collections, type RetrospectivesResponse} from '$lib/types/pocketbase-types';

export async function fetchUsersRetros(
  pb: PocketBase,
  userId: string,
): Promise<RetrospectivesResponse[]> {
  try {
    const retros = await pb
      .collection(Collections.Retrospectives)
      .getFullList<RetrospectivesResponse>(undefined, {
        sort: '-created',
        filter: `organizer = "${userId}" || attendees.id ?= "${userId}"`,
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
