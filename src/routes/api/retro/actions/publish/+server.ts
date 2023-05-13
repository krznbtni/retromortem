import {error, redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';

import type {ClientResponseError} from 'pocketbase';

import {Collections, type RetrospectivesResponse} from '$lib/types/pocketbase-types';

interface PublishBody {
  assignees?: string;
  retroId?: string;
  text?: string;
}

export const POST = (async ({locals, request}) => {
  const body = (await request.json()) as PublishBody;

  if (!body.assignees || !body.retroId || !body.text || !body.text.length) {
    throw error(400, 'Invalid request body');
  }

  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  try {
    const createActionResponse = await locals.pb
      .collection(Collections.Actions)
      .create({assignees: body.assignees, text: body.text, state: 'todo'});

    const retro = await locals.pb
      .collection(Collections.Retrospectives)
      .getOne<RetrospectivesResponse>(body.retroId);

    retro.actions.push(createActionResponse.id);

    await locals.pb.collection(Collections.Retrospectives).update(body.retroId, retro);
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('POST -> e:', e);
    console.error('POST -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;
