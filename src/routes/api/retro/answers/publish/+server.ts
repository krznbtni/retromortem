import {error, redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import type {ClientResponseError} from 'pocketbase';
import {Collections, type QuestionsResponse} from '$lib/types/pocketbase-types';

interface PublishBody {
  questionId?: string;
  retroId?: string;
  details?: string;
}

export const POST = (async ({locals, request}) => {
  const body = (await request.json()) as PublishBody;

  if (!body.questionId || !body.retroId || !body.details) {
    throw error(400, 'Invalid request body');
  }

  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  try {
    const createAnswerResponse = await locals.pb
      .collection(Collections.Answers)
      .create({creator: locals.user.id, details: body.details});
    const question = await locals.pb
      .collection(Collections.Questions)
      .getOne<QuestionsResponse>(body.questionId);
    question.answers.push(createAnswerResponse.id);
    await locals.pb.collection(Collections.Questions).update(body.questionId, question);
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('POST -> e:', e);
    console.error('POST -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;
