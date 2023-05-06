import {error, fail, redirect} from '@sveltejs/kit';
import type {Actions, PageServerLoad} from './$types';
import type {ClientResponseError} from 'pocketbase';
import {Collections, type RetrospectivesRecord} from '$lib/types/pocketbase-types';

export const load = (({locals}) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(303, '/login');
  }
}) satisfies PageServerLoad;

interface Submission extends RetrospectivesRecord {
  date: string;
  time: string;
  questionsIn: string;
}

export const actions: Actions = {
  create: async ({locals, request}) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    const formDataRaw = await request.formData();
    console.log('create: -> formDataRaw:', formDataRaw);
    formDataRaw.append('organizer', locals.user?.id);
    const formDataParsed: Partial<Submission> = Object.fromEntries(formDataRaw);

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    formDataParsed.scheduled = new Date(`${formDataParsed.date} ${formDataParsed.time}`)
      .toISOString()
      .replace('T', ' ');

    if (!formDataParsed.title) {
      return fail(400, {data: formDataParsed, errors: {title: 'You must enter a title'}});
    }

    const questions: Array<string> = [];

    if (formDataParsed.questionsIn) {
      const parsedBodyQuestions = JSON.parse(formDataParsed.questionsIn) as Array<string>;
      console.log('create: -> parsedBodyQuestions:', parsedBodyQuestions);

      for (const question of parsedBodyQuestions) {
        const res = await locals.pb.collection(Collections.Questions).create({title: question});
        console.log('create: -> res:', res);

        questions.push(res.id);
      }

      formDataParsed.questions = questions;
    }

    // TODO: validation
    // if (errors) {
    //   return fail(400, {
    //     data: rest,
    //     errors: errors.fieldErrors,
    //   });
    // }

    try {
      const r = await locals.pb.collection(Collections.Retrospectives).create(formDataParsed);
      console.log('create: -> r:', r);
    } catch (err) {
      const e = err as ClientResponseError;
      console.log('Error: ', e);
      throw error(e.status, e.message);
    }

    console.log('?????????+');

    throw redirect(303, '/retro');
  },
};
