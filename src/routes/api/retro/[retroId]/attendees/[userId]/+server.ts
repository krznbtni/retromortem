import {error, json, redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';

import type {ClientResponseError} from 'pocketbase';

import {Collections, type UsersResponse} from '$lib/types/pocketbase-types';
import {fetchRetro} from '$lib/fetch-retro';
import {sendRetroInvitationEmail} from '$lib/server/postmark/send-retro-invitation-email';

const SEND_EMAIL = false;

export const POST = (async ({locals, params}) => {
  if (!locals.user?.id || !locals.pb.authStore.isValid) {
    throw redirect(303, '/login');
  }

  try {
    const retro = await fetchRetro(locals.pb, params.retroId);

    if (retro.organizer !== locals.user.id) {
      throw error(401, 'Unauthorized');
    } else if (retro.attendees.includes(params.userId)) {
      return json({success: true});
    }

    retro.attendees.push(params.userId);
    await locals.pb.collection(Collections.Retrospectives).update(params.retroId, retro);

    const recipientUser = await locals.pb
      .collection(Collections.Users)
      .getOne<UsersResponse>(params.userId);
    const sendingUser = await locals.pb
      .collection(Collections.Users)
      .getOne<UsersResponse>(locals.user.id);

    if (SEND_EMAIL) {
      await sendRetroInvitationEmail({
        to: recipientUser.email,
        recipientUsername: recipientUser.username,
        senderUsername: sendingUser.username,
        retroId: params.retroId,
      });
    }
  } catch (e) {
    const err = e as ClientResponseError;
    console.error(`/retro/${params.retroId}/attendees/${params.userId} -> error: `, err);
    console.error(
      `/retro/${params.retroId}/attendees/${params.userId} -> error.response: `,
      err.response,
    );

    throw error(err.status, err.message);
  }

  throw redirect(303, '/retro');
}) satisfies RequestHandler;
