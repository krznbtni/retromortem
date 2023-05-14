import {error, redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import type {ClientResponseError} from 'pocketbase';
import {Collections, type AnswersResponse} from '$lib/types/pocketbase-types';

export const DELETE = (async ({locals, params}) => {
  if (!params.answerId) {
    throw error(400, 'Invalid request body');
  }

  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  try {
    const answer = await locals.pb
      .collection(Collections.Answers)
      .getOne<AnswersResponse>(params.answerId, {filter: `creator = '${locals.user.id}'`});

    for (const voteId of answer.votes) {
      await locals.pb.collection(Collections.Votes).delete(voteId);
    }

    await locals.pb
      .collection(Collections.Answers)
      .delete(params.answerId, {filter: `creator = '${locals.user.id}'`});
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('DELETE -> e:', e);
    console.error('DELETE -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;

interface UpdateBody {
  text?: string;
}

export const PUT = (async ({locals, request, params}) => {
  const body = (await request.json()) as UpdateBody;

  if (!params.answerId || !body.text) {
    throw error(400, 'Invalid request body');
  }

  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  try {
    const answer = await locals.pb
      .collection(Collections.Answers)
      .getOne<AnswersResponse>(params.answerId, {filter: `creator = '${locals.user.id}'`});

    answer.text = body.text;

    await locals.pb.collection(Collections.Answers).update(params.answerId, answer);
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('PUT -> e:', e);
    console.error('PUT -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;
