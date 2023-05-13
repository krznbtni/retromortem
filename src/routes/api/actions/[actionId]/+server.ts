import {error, redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import type {ClientResponseError} from 'pocketbase';
import {Collections, type ActionsResponse} from '$lib/types/pocketbase-types';

export const DELETE = (async ({locals, params}) => {
  if (!params.actionId) {
    throw error(400, 'Invalid request body');
  }

  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  try {
    await locals.pb.collection(Collections.Actions).delete(params.actionId);
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('DELETE -> e:', e);
    console.error('DELETE -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;

type UpdateBody = ActionsResponse;

export const PUT = (async ({locals, request, params}) => {
  const body = (await request.json()) as UpdateBody;

  if (!params.actionId) {
    throw error(400, 'Invalid request body');
  }

  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  try {
    const action = await locals.pb
      .collection(Collections.Actions)
      .getOne<ActionsResponse>(params.actionId);

    if (body.text) {
      action.text = body.text;
    }

    if (body.assignees) {
      action.assignees = body.assignees;
    }

    if (body.state) {
      action.state = body.state;
    }

    if (body.due) {
      action.due = new Date(body.due).toISOString().replace('T', ' ');
    }

    await locals.pb.collection(Collections.Actions).update(params.actionId, action);
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('PUT -> e:', e);
    console.error('PUT -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;
