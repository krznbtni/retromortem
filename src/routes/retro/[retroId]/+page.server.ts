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

function isOrganizer(userId: string, organizer: string): boolean {
  return userId === organizer;
}

function isAttendee(userId: string, attendees: Array<string>): boolean {
  return attendees.includes(userId);
}

export const load = (async event => {
  const {locals, params} = event;
  const {retroId} = params;

  if (!locals.user || !locals.pb.authStore.isValid) {
    throw redirect(303, '/login');
  }

  const retro = await fetchRetro<ExpandedRetrospective>(
    locals.pb,
    retroId,
    'organizer,attendees,questions.answers.creator,questions.answers.votes,questions.answers.votes.user,actions.assignees',
  );

  if (
    !isOrganizer(locals.user.id, retro.organizer) &&
    !isAttendee(locals.user.id, retro.attendees)
  ) {
    throw redirect(303, '/retro');
  }

  return {
    retro,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  leaveRetro: async ({locals, params}) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    try {
      const retro = await fetchRetro<ExpandedRetrospective>(locals.pb, params.retroId);

      if (
        isOrganizer(locals.user.id, retro.organizer) ||
        !isAttendee(locals.user.id, retro.attendees)
      ) {
        return {success: true};
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
