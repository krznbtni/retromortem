import {error, fail, redirect} from '@sveltejs/kit';
import type {Actions, PageServerLoad} from './$types';
import {serialize} from 'object-to-formdata';
import type {ClientResponseError} from 'pocketbase';
import type {Retro} from '$lib/types/retro';

export const load = (({locals}) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(303, '/login');
  }
}) satisfies PageServerLoad;

interface Submission extends Retro {
  date: string;
  time: string;
}

export const actions: Actions = {
  create: async ({locals, request}) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    const formDataRaw = await request.formData();
    formDataRaw.append('organizer', locals.user?.id);

    const formDataParsed: Partial<Submission> = Object.fromEntries(formDataRaw);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    formDataParsed.scheduled = new Date(`${formDataParsed.date} ${formDataParsed.time}`)
      .toISOString()
      .replace('T', ' ');
    console.log('create: -> formDataParsed:', formDataParsed);

    if (!formDataParsed.name) {
      return fail(400, {data: formDataParsed, errors: {name: 'You must enter a name'}});
    }

    // TODO: validation
    // if (errors) {
    //   return fail(400, {
    //     data: rest,
    //     errors: errors.fieldErrors,
    //   });
    // }

    try {
      await locals.pb.collection('retrospectives').create(serialize(formDataParsed));
      return {success: true};
    } catch (err) {
      const e = err as ClientResponseError;
      console.log('Error: ', e);
      throw error(e.status, e.message);
    }

    // throw redirect(303, '/');
  },
};
