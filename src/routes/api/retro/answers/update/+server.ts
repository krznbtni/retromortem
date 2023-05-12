import {error, redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import type {ClientResponseError} from 'pocketbase';
import {Collections, type AnswersResponse} from '$lib/types/pocketbase-types';

interface UpdateBody {
  id?: string;
  text?: string;
}

export const POST = (async ({locals, request}) => {
  const body = (await request.json()) as UpdateBody;

  if (!body.id || !body.text) {
    throw error(400, 'Invalid request body');
  }

  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  try {
    const answer = await locals.pb
      .collection(Collections.Answers)
      .getOne<AnswersResponse>(body.id, {filter: `creator = '${locals.user.id}'`});

    answer.text = body.text;

    await locals.pb.collection(Collections.Answers).update(body.id, answer);
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('POST -> e:', e);
    console.error('POST -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;
