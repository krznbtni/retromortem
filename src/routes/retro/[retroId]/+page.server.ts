import {fetchRetro} from '$lib/server/retro/fetch-retro';
import type {Actions, PageServerLoad} from './$types';
import {
  Collections,
  type QuestionsResponse,
  type RetrospectivesResponse,
  type UsersResponse,
} from '$lib/types/pocketbase-types';
import {error, redirect} from '@sveltejs/kit';
import type {ClientResponseError} from 'pocketbase';

interface Expanded extends RetrospectivesResponse {
  expand: {
    organizer: UsersResponse;
    attendees: Array<UsersResponse>;
    questions: Array<QuestionsResponse>;
  };
}

export const load = (async event => {
  const {locals, params} = event;
  const {retroId} = params;

  if (!locals.user) {
    throw redirect(303, '/login');
  }

  const retro = await fetchRetro<Expanded>(
    locals,
    retroId,
    'organizer,attendees,questions.answers',
  );

  return {
    isOrganizer: locals.user.id === retro.organizer,
    isAttendee: retro.attendees?.includes(locals.user.id),
    retro,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  joinRetro: async ({locals, params}) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    try {
      const retro = await fetchRetro<Expanded>(locals, params.retroId);

      if (locals.user.id === retro.organizer || retro.attendees?.includes(locals.user.id)) {
        return {
          success: true,
        };
      }

      retro.attendees?.push(locals.user.id);

      await locals.pb.collection(Collections.Retrospectives).update(params.retroId, retro);
    } catch (err) {
      const e = err as ClientResponseError;
      console.error('actions -> joinRetro: -> e:', e);
      throw error(e.status, e.message);
    }

    return {
      success: true,
    };
  },
  leaveRetro: async ({locals, params}) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    try {
      const retro = await fetchRetro<Expanded>(locals, params.retroId);
      console.log('leaveRetro: -> retro:', retro);
      console.log('leaveRetro: -> locals.user.id:', locals.user.id);

      if (locals.user.id === retro.organizer || !retro.attendees?.includes(locals.user.id)) {
        return {
          success: true,
        };
      }

      retro.attendees = retro.attendees?.filter(attendee => attendee !== locals.user?.id);

      await locals.pb.collection(Collections.Retrospectives).update(params.retroId, retro);
    } catch (err) {
      const e = err as ClientResponseError;
      console.error('actions -> leaveRetro: -> e:', e);
      throw error(e.status, e.message);
    }

    return {
      success: true,
    };
  },
};
