import {error, redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import type {ClientResponseError} from 'pocketbase';
import {Collections} from '$lib/types/pocketbase-types';

interface DeleteBody {
  id?: string;
}

export const POST = (async ({locals, request}) => {
  const body = (await request.json()) as DeleteBody;

  if (!body.id) {
    throw error(400, 'Invalid request body');
  }

  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  try {
    await locals.pb
      .collection(Collections.Answers)
      .delete(body.id, {filter: `creator = '${locals.user.id}'`});
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('POST -> e:', e);
    console.error('POST -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;
