import {error, redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import type {ClientResponseError} from 'pocketbase';
// import {PROD} from '$env/static/private';

interface LoginBody {
  email?: string;
  password?: string;
}

export const POST = (async ({locals, request}) => {
  // if (PROD) {
  //   throw error(400, 'YOU SHALL NOT PASS');
  // }

  const body = (await request.json()) as LoginBody;

  if (!body.email || !body.password) {
    throw error(400, 'Invalid request body');
  }

  try {
    await locals.pb.collection('users').authWithPassword(body.email, body.password);
  } catch (err) {
    const e = err as ClientResponseError;
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;
