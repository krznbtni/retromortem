import {error, redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import type {ClientResponseError} from 'pocketbase';

import {fetchRetro} from '$lib/fetch-retro';
import {
  Collections,
  type AnswersResponse,
  type QuestionsResponse,
  type RetrospectivesResponse,
} from '$lib/types/pocketbase-types';

interface ExpandedQuestion extends QuestionsResponse {
  expand: {
    answers: Array<AnswersResponse>;
  };
}

interface ExpandedRetrospective extends RetrospectivesResponse {
  expand: {
    questions: Array<ExpandedQuestion>;
  };
}

export const DELETE = (async ({locals, params}) => {
  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  // Find all questions belonging to this retro -> DELETE
  try {
    const retro = await fetchRetro<ExpandedRetrospective>(
      locals.pb,
      params.retroId,
      'questions.answers.votes',
    );

    if (retro.organizer !== locals.user.id) {
      throw error(401, 'Unauthorized');
    }

    const voteIds =
      retro.expand.questions
        ?.flatMap(question => question.expand.answers?.flatMap(answer => answer.votes))
        .filter(x => x) || [];

    for (const voteId of voteIds) {
      await locals.pb.collection(Collections.Votes).delete(voteId);
    }

    const answerIds = retro.expand.questions?.flatMap(question => question.answers) || [];

    for (const answerId of answerIds) {
      await locals.pb.collection(Collections.Answers).delete(answerId);
    }

    for (const questionId of retro.questions) {
      await locals.pb.collection(Collections.Questions).delete(questionId);
    }

    await locals.pb.collection(Collections.Retrospectives).delete(params.retroId);
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('POST -> e:', e);
    console.error('POST -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(308, '/retro');
}) satisfies RequestHandler;
