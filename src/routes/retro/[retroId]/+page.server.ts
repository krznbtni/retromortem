import {fetchRetro} from '$lib/fetch-retro';
import type {Actions, PageServerLoad} from './$types';
import {
  Collections,
  type AnswersResponse,
  type QuestionsResponse,
  type RetrospectivesResponse,
  type UsersResponse,
  type VotesResponse,
  type ActionsResponse,
} from '$lib/types/pocketbase-types';
import {error, redirect} from '@sveltejs/kit';
import type {ClientResponseError} from 'pocketbase';

export interface ExpandedVotes extends VotesResponse {
  expand: {
    user: UsersResponse;
  };
}

export interface ExpandedAnswers extends AnswersResponse {
  expand: {
    creator: UsersResponse;
    votes: Array<ExpandedVotes>;
  };
}

interface ExpandedQuestion extends QuestionsResponse {
  expand: {
    answers: Array<ExpandedAnswers>;
  };
}

interface ExpandedAction extends ActionsResponse {
  expand: {
    assignees: Array<UsersResponse>;
  };
}

export interface ExpandedRetrospective extends RetrospectivesResponse {
  expand: {
    organizer: UsersResponse;
    attendees: Array<UsersResponse>;
    questions: Array<ExpandedQuestion>;
    actions: Array<ExpandedAction>;
  };
}

export const load = (async event => {
  const {locals, params} = event;
  const {retroId} = params;

  if (!locals.user) {
    throw redirect(303, '/login');
  }

  const retro = await fetchRetro<ExpandedRetrospective>(
    locals.pb,
    retroId,
    'organizer,attendees,questions.answers.creator,questions.answers.votes,questions.answers.votes.user,actions.assignees',
  );

  return {
    isOrganizer: locals.user.id === retro.organizer,
    isAttendee: retro.attendees?.includes(locals.user.id),
    userId: locals.user.id,
    retro,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  joinRetro: async ({locals, params}) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    try {
      const retro = await fetchRetro<ExpandedRetrospective>(locals.pb, params.retroId);

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
      const retro = await fetchRetro<ExpandedRetrospective>(locals.pb, params.retroId);

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
