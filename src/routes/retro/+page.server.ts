import {error, fail, redirect} from '@sveltejs/kit';
import type {Actions, PageServerLoad} from './$types';

import type {ClientResponseError} from 'pocketbase';

import {fetchUsersRetros} from '$lib/server/retro/fetch-users-retros';
import {Collections} from '$lib/types/pocketbase-types';

export const load = (({locals}) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(303, '/login');
  }

  return {
    retros: fetchUsersRetros(locals),
  };
}) satisfies PageServerLoad;

interface DeleteRetroBody {
  id?: string;
}

export const actions: Actions = {
  deleteRetro: async ({locals, request}) => {
    const body: DeleteRetroBody = Object.fromEntries(await request.formData());

    if (!body.id) {
      return fail(400, {
        errors: {
          id: ['Missing required properties'],
        },
      });
    }

    try {
      await locals.pb.collection(Collections.Retrospectives).delete(body.id);
    } catch (err) {
      const e = err as ClientResponseError;
      console.log('Error: ', e);
      throw error(e.status, e.message);
    }

    return {
      success: true,
    };
  },
};
