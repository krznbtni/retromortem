import {error, fail, redirect} from '@sveltejs/kit';
import type {Actions, PageServerLoad} from './$types';
import type {ClientResponseError} from 'pocketbase';
import type {RetroCreateRequest} from '$lib/types/retro';

export const load = (({locals}) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(303, '/login');
  }

  // const retro = await locals.pb.collection('retrospectives').getOne('2ijjvdbd3sx4kjc');
  // retro.participants = ['4l2m06194g3lnzi', 'pz4qjqitdz53xux'];
  // console.log('load -> retro:', retro);

  // const updatedRetro = await locals.pb.collection('retrospectives').update(retro.id, retro);
  // console.log('load -> updatedRetro:', updatedRetro);
}) satisfies PageServerLoad;

interface Submission extends RetroCreateRequest {
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
      const retrospectiveResult = await locals.pb
        .collection('retrospectives')
        .create(formDataParsed);

      if (formDataParsed.questions) {
        const parsedBodyQuestions = JSON.parse(formDataParsed.questions) as Array<string>;

        for (const question of parsedBodyQuestions) {
          await locals.pb.collection('questions').create({
            title: question,
            creator: locals.user?.id,
            retrospective: retrospectiveResult.id,
          });
        }
      }
    } catch (err) {
      const e = err as ClientResponseError;
      console.log('Error: ', e);
      throw error(e.status, e.message);
    }

    throw redirect(303, '/retro');
  },
};
