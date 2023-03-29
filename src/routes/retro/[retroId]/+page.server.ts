import {fetchRetro} from '$lib/server/retro/fetch-retro';
import {fetchRetroQuestions} from '$lib/server/fetch-retro-questions';
import type {PageServerLoad} from './$types';
import type {RetrospectiveResponse, UsersResponse} from '$lib/types/pocketbase-types';

interface Expanded extends RetrospectiveResponse {
  expand: {
    organizer: UsersResponse;
    participants: Array<UsersResponse>;
  };
}

export const load = (async event => {
  const {retroId} = event.params;

  return {
    retro: await fetchRetro<Expanded>(event.locals, retroId, 'organizer,participants'),
    questions: await fetchRetroQuestions(event.locals, retroId),
  };
}) satisfies PageServerLoad;
