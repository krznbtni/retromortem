import {error, fail, redirect} from '@sveltejs/kit';
import type {Actions, PageServerLoad} from './$types';
import type {ClientResponseError} from 'pocketbase';
import {
  Collections,
  type QuestionsResponse,
  type RetrospectivesRecord,
  type RetrospectivesResponse,
} from '$lib/types/pocketbase-types';
import {fetchRetro} from '$lib/fetch-retro';

interface ExpandedRetrospective extends RetrospectivesResponse {
  expand: {
    questions: Array<QuestionsResponse>;
  };
}

export const load = (async event => {
  const {locals, params} = event;
  const {retroId} = params;

  if (!locals.pb.authStore.isValid || !locals.user) {
    throw redirect(303, '/login');
  }

  const retro = await fetchRetro<ExpandedRetrospective>(locals.pb, retroId, 'questions');

  if (locals.user.id !== retro.organizer) {
    throw error(401, 'Unauthorized');
  }

  return {
    retro,
  };
}) satisfies PageServerLoad;

interface Submission extends RetrospectivesRecord {
  newQuestions: string;
  updatedQuestions: string;
  dateTime: string;
}

export const actions: Actions = {
  updateRetro: async ({locals, request, params}) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    const formDataRaw = await request.formData();
    const formDataParsed: Partial<Submission> = Object.fromEntries(formDataRaw);

    if (!formDataParsed.title) {
      return fail(400, {data: formDataParsed, errors: {title: 'You must enter a title'}});
    } else if (!formDataParsed.dateTime) {
      return fail(400, {
        data: formDataParsed,
        errors: {dateTime: 'You must enter a date and time'},
      });
    }

    formDataParsed.scheduled = new Date(formDataParsed.dateTime).toISOString().replace('T', ' ');

    const questionIdsToAdd: Array<string> = [];

    if (formDataParsed.newQuestions) {
      const parsedBodyQuestions = JSON.parse(formDataParsed.newQuestions) as Array<string>;

      for (const question of parsedBodyQuestions) {
        const res = await locals.pb.collection(Collections.Questions).create({title: question});
        questionIdsToAdd.push(res.id);
      }
    }

    const currentRetro = await fetchRetro<ExpandedRetrospective>(
      locals.pb,
      params.retroId,
      'questions',
    );
    const questionIdsToKeep: Array<string> = [];

    if (formDataParsed.updatedQuestions) {
      const parsedUpdatedQuestions = JSON.parse(
        formDataParsed.updatedQuestions,
      ) as Array<QuestionsResponse>;
      const parsedUpdatedQuestionsIds = parsedUpdatedQuestions.map(question => question.id);

      const questionIdsToDelete = currentRetro.questions.filter(
        questionId => !parsedUpdatedQuestionsIds.includes(questionId),
      );

      for (const questionId of questionIdsToDelete) {
        await locals.pb.collection(Collections.Questions).delete(questionId);
      }

      for (const updatedQuestion of parsedUpdatedQuestions) {
        const currentQuestionData = currentRetro.expand.questions.find(
          question => question.id === updatedQuestion.id,
        );
        questionIdsToKeep.push(updatedQuestion.id);

        if (currentQuestionData && currentQuestionData.title !== updatedQuestion.title) {
          await locals.pb
            .collection(Collections.Questions)
            .update(updatedQuestion.id, updatedQuestion);
        }
      }
    }

    const finalQuestionIds = questionIdsToAdd.concat(questionIdsToKeep);
    formDataParsed.questions = finalQuestionIds;

    try {
      await locals.pb.collection(Collections.Retrospectives).update(params.retroId, formDataParsed);
    } catch (err) {
      const e = err as ClientResponseError;
      console.log('Error: ', e);
      throw error(e.status, e.message);
    }

    throw redirect(303, `/retro/${params.retroId}`);
  },
};
