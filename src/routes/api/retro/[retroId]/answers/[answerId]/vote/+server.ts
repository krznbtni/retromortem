import {error, json, redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import type {ClientResponseError} from 'pocketbase';
import {
  Collections,
  type AnswersResponse,
  type RetrospectivesResponse,
  type UsersResponse,
  type VotesResponse,
} from '$lib/types/pocketbase-types';

interface ExpandedVotes extends VotesResponse {
  expand: {
    user: UsersResponse;
  };
}

interface ExpandedAnswers extends AnswersResponse {
  expand: {
    votes: Array<ExpandedVotes>;
  };
}

function findVote(
  userId: string,
  votes: Array<ExpandedVotes> | undefined,
): ExpandedVotes | undefined {
  return votes?.find(vote => vote.expand.user.id === userId);
}

function hasVotedForAnswer(userId: string, votes: Array<ExpandedVotes> | undefined): boolean {
  if (findVote(userId, votes)) {
    return true;
  } else {
    return false;
  }
}

export const POST = (async ({locals, params}) => {
  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  try {
    const retro = await locals.pb
      .collection(Collections.Retrospectives)
      .getOne<RetrospectivesResponse>(params.retroId);

    const isParticipant =
      locals.user.id === retro.organizer || retro.attendees.includes(locals.user.id);

    // TODO: properly handle this, my friend... exit early etc.
    if (!isParticipant) {
      return json({success: false, message: 'BRO U MUZT BE PARTIZIPANT'});
    }

    const answer = await locals.pb
      .collection(Collections.Answers)
      .getOne<ExpandedAnswers>(params.answerId, {expand: 'votes.user'});

    if (hasVotedForAnswer(locals.user.id, answer.expand.votes)) {
      // TODO: properly handle this, my friend... exit early etc.
      return json({success: false, message: 'BRO U HAS ALREADY votedZZZ'});
    }

    const createdVote = await locals.pb
      .collection(Collections.Votes)
      .create({user: locals.user.id});

    answer.votes.push(createdVote.id);
    await locals.pb.collection(Collections.Answers).update(params.answerId, answer);
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('POST -> e:', e);
    console.error('POST -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;

export const DELETE = (async ({locals, params}) => {
  if (!locals.user?.id) {
    throw redirect(303, '/login');
  }

  try {
    if (!params.retroId) {
      throw error(400, 'Invalid request body');
    } else if (!params.answerId) {
      throw error(400, 'Invalid request body');
    }

    const retro = await locals.pb
      .collection(Collections.Retrospectives)
      .getOne<RetrospectivesResponse>(params.retroId);

    const isParticipant =
      locals.user.id === retro.organizer || retro.attendees.includes(locals.user.id);

    // TODO: properly handle this, my friend... exit early etc.
    if (!isParticipant) {
      return json({success: false, message: 'BRO U MUZT BE PARTIZIPANT'});
    }

    const answer = await locals.pb
      .collection(Collections.Answers)
      .getOne<ExpandedAnswers>(params.answerId, {expand: 'votes.user'});

    if (!hasVotedForAnswer(locals.user.id, answer.expand.votes)) {
      // TODO: properly handle this, my friend... exit early etc.
      return json({success: false, message: 'BRO U HAS NOT VOTEDZ FOR THIS ANSWERSZ'});
    }

    const foundVote = findVote(locals.user.id, answer.expand.votes);

    if (foundVote) {
      await locals.pb.collection(Collections.Votes).delete(foundVote.id);
    }
  } catch (err) {
    const e = err as ClientResponseError;
    console.error('POST -> e:', e);
    console.error('POST -> e.response:', e.response);
    throw error(e.status, e.message);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;
