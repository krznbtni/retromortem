<script lang="ts">
import Icon from '@iconify/svelte';

import type {PageData} from './$types';
import {onDestroy, onMount} from 'svelte';
import {
  Collections,
  type AnswersResponse,
  type QuestionsResponse,
  type RetrospectivesResponse,
  type UsersResponse,
  type VotesResponse,
} from '$lib/types/pocketbase-types';
import {pb} from '$lib/pocketbase';
import {Input} from '$lib/components';
import {enhance, type SubmitFunction} from '$app/forms';

interface ExpandedVotes extends VotesResponse {
  expand: {
    user: UsersResponse;
  };
}

interface ExpandedAnswers extends AnswersResponse {
  expand: {
    creator: UsersResponse;
    votes: Array<ExpandedVotes>;
  };
}

interface ExpandedQuestion extends QuestionsResponse {
  expand: {
    answers: Array<ExpandedAnswers>;
  };
}

interface ExpandedRetrospective extends RetrospectivesResponse {
  expand: {
    organizer: UsersResponse;
    attendees: Array<UsersResponse>;
    questions: Array<ExpandedQuestion>;
  };
}

export let data: PageData;

let loading = false;
let retrosUnsubscribe: () => Promise<void>;
let questionsUnsubscribe: () => Promise<void>;
let answersUnsubscribe: () => Promise<void>;

$: ({retro, isOrganizer, isAttendee, userId} = data);

$: attendees = retro.expand.attendees || [];
$: questions =
  retro.expand.questions.sort((a, b) => +new Date(a.created) - +new Date(b.created)) || [];

$: created = new Date(retro.created).toLocaleString('sv-SE');
$: updated = new Date(retro.updated).toLocaleString('sv-SE');
$: scheduled = retro.scheduled
  ? new Date(retro.scheduled).toLocaleString('sv-SE')
  : 'No scheduled date';

$: allAnswerIds = questions.map(question => question.answers).flat();
$: showJoinButton = !isOrganizer && !isAttendee;
$: showLeaveButton = !isOrganizer && isAttendee;

async function refetchRetro(): Promise<ExpandedRetrospective> {
  return pb.collection(Collections.Retrospectives).getOne<ExpandedRetrospective>(retro.id, {
    expand:
      'organizer,attendees,questions.answers.creator,questions.answers.votes,questions.answers.votes.user',
  });
}

onMount(async () => {
  retrosUnsubscribe = await pb
    .collection(Collections.Retrospectives)
    .subscribe(retro.id, ({action}) => {
      if (action === 'update') {
        void refetchRetro().then(res => (retro = res));
      }
    });

  questionsUnsubscribe = await pb.collection(Collections.Questions).subscribe('*', ({record}) => {
    if (retro.questions.includes(record.id)) {
      void refetchRetro().then(res => (retro = res));
    }
  });

  // Do this better.
  answersUnsubscribe = await pb.collection(Collections.Answers).subscribe('*', ({record}) => {
    if (allAnswerIds.includes(record.id)) {
      void refetchRetro().then(res => (retro = res));
    }
  });
});

onDestroy(async () => {
  await retrosUnsubscribe?.();
  await questionsUnsubscribe?.();
  await answersUnsubscribe?.();
});

interface NewAnswer {
  questionId: string;
  text: string;
}

let newAnswers: Array<NewAnswer> = [];

function draftAnswer(questionId: string): void {
  newAnswers = [...newAnswers, {questionId, text: ''}];
}

async function publishAnswer(index: number): Promise<void> {
  const newAnswer = newAnswers[index];

  await fetch('/api/retro/answers/publish', {
    method: 'POST',
    body: JSON.stringify({...newAnswer, retroId: retro.id}),
    headers: {'Content-Type': 'application/json'},
  });

  newAnswers = newAnswers.filter((_, i) => i !== index);
}

function hasVotedForAnswer(votes: Array<ExpandedVotes> | undefined): boolean {
  if (votes && votes.find(vote => vote.expand.user.id === userId)) {
    return true;
  } else {
    return false;
  }
}

async function addVote(answer: ExpandedAnswers): Promise<void> {
  if (hasVotedForAnswer(answer.expand.votes)) {
    return;
  }

  await fetch('/api/retro/answers/vote/add', {
    method: 'POST',
    body: JSON.stringify({retroId: retro.id, answerId: answer.id}),
    headers: {'Content-Type': 'application/json'},
  });
}

async function removeVote(answer: ExpandedAnswers): Promise<void> {
  if (!hasVotedForAnswer(answer.expand.votes)) {
    return;
  }

  await fetch('/api/retro/answers/vote/remove', {
    method: 'POST',
    body: JSON.stringify({retroId: retro.id, answerId: answer.id}),
    headers: {'Content-Type': 'application/json'},
  });
}

// TODO: handle errors/failure
const submitJoinRetro = (() => {
  if (loading) {
    return;
  }

  loading = true;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async ({update}) => {
    await update();
    loading = false;
  };
}) satisfies SubmitFunction;

const submitLeaveRetro = (() => {
  if (loading) {
    return;
  }

  loading = true;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async ({update}) => {
    await update();
    loading = false;
  };
}) satisfies SubmitFunction;

let isEditingAnswers: Record<string, string> = {};

function setIsEditingAnswer({id, text}: {id: string; text: string}): void {
  if (id in isEditingAnswers) {
    delete isEditingAnswers[id];
    isEditingAnswers = {...isEditingAnswers};
  } else {
    isEditingAnswers[id] = text;
  }
}

async function updateAnswer(id: string): Promise<void> {
  loading = true;

  await fetch('/api/retro/answers/update', {
    method: 'POST',
    body: JSON.stringify({id, text: isEditingAnswers[id]}),
    headers: {'Content-Type': 'application/json'},
  });

  delete isEditingAnswers[id];
  isEditingAnswers = {...isEditingAnswers};

  loading = false;
}
</script>

<div class="container p-10 space-y-4">
  <div class="flex flex-row justify-between items-center">
    <h1>{retro.title}</h1>

    {#if isOrganizer}
      <a href="/retro/{retro.id}/edit">
        <Icon icon="mdi:pencil" style="font-size: 1.5rem;" />
      </a>
    {/if}
  </div>
  <hr />

  <div class="flex flex-col md:flex-row md:justify-between">
    <p><strong>Created:</strong> {created}</p>
    <p><strong>Updated:</strong> {updated}</p>
    <p><strong>Scheduled:</strong> {scheduled}</p>
  </div>

  <p><strong>Organizer:</strong> {retro.expand.organizer.username}</p>
  <p><strong>Details:</strong> {retro.details}</p>

  <div class="flex w-full items-center">
    <h2>Attendees</h2>

    {#if showJoinButton}
      <form method="POST" class="ml-4" use:enhance={submitJoinRetro}>
        <button
          class="btn btn-sm variant-filled-primary"
          disabled={loading}
          formaction="?/joinRetro"
        >
          <span>Join</span>
          <span class="text-base"><Icon icon="mdi:account-plus" /></span>
        </button>
      </form>
    {/if}

    {#if showLeaveButton}
      <form method="POST" class="ml-4" use:enhance={submitLeaveRetro}>
        <button
          class="btn btn-sm variant-filled-warning"
          disabled={loading}
          formaction="?/leaveRetro"
        >
          <span>Leave</span>
          <span class="text-base"><Icon icon="mdi:account-cancel" /></span>
        </button>
      </form>
    {/if}
  </div>

  <div class="flex flex-wrap gap-3">
    {#if !attendees.length}
      <span>lol u has no friends?</span>
    {:else}
      {#each attendees as attendee}
        <span class="badge variant-filled">{attendee.name}</span>
      {/each}
    {/if}
  </div>

  <div class="flex flex-col w-full">
    <h2>Questions</h2>

    {#each questions as question (question.id)}
      <article class="mt-4">
        <h3>{question.title}</h3>

        <section class="m-3 border-l-4 p-1">
          {#if question.expand.answers}
            {#each question.expand.answers as answer, index (answer.id)}
              <article
                class="m-3 border-l-4 pl-3"
                class:border-l-indigo-500={index % 2}
                class:border-l-yellow-500={!(index % 2)}
              >
                <section class="flex justify-between items-center">
                  <p>
                    <strong>Creator:</strong>
                    {answer.expand.creator.username}
                  </p>

                  {#if answer.expand.creator.id === userId}
                    <button
                      class="btn btn-sm variant-filled-primary"
                      disabled={loading}
                      type="button"
                      on:click={() => setIsEditingAnswer(answer)}
                    >
                      <span>
                        <Icon icon="mdi:pencil" />
                      </span>
                    </button>
                  {/if}
                </section>

                {#if !(answer.id in isEditingAnswers)}
                  <p><strong>Text:</strong> {answer.text}</p>
                {:else}
                  <Input
                    id="answer-{answer.id}"
                    label="Answer"
                    bind:value={isEditingAnswers[answer.id]}
                    disabled={loading}
                  />
                  <section class="flex mb-3">
                    <button
                      class="btn btn-sm variant-filled-primary"
                      disabled={loading}
                      on:click={() => updateAnswer(answer.id)}
                      type="button"
                    >
                      <span>Update</span>
                    </button>

                    <button
                      class="btn btn-sm variant-filled-warning ml-3"
                      disabled={loading}
                      on:click={() => setIsEditingAnswer(answer)}
                      type="button"
                    >
                      <span>Cancel</span>
                    </button>
                  </section>
                {/if}

                <p>
                  <strong>Votes:</strong>
                  {#if answer.expand.votes}
                    {#each answer.expand.votes as vote, index (vote.id)}
                      <span class="badge variant-filled" class:ml-3={index !== 0}>
                        {vote.expand.user.username}
                      </span>
                    {/each}
                  {/if}
                </p>

                {#if (isOrganizer || isAttendee) && hasVotedForAnswer(answer.expand.votes)}
                  <button
                    class="btn btn-sm variant-filled-warning mt-2"
                    disabled={loading}
                    type="button"
                    on:click={() => removeVote(answer)}
                  >
                    <span>Remove vote</span>
                    <span class="text-base"><Icon icon="mdi:thumbs-up-down" /></span>
                  </button>
                {:else if (isOrganizer || isAttendee) && !hasVotedForAnswer(answer.expand.votes)}
                  <button
                    class="btn btn-sm variant-filled-primary mt-2"
                    disabled={loading}
                    type="button"
                    on:click={() => addVote(answer)}
                  >
                    <span>Add vote</span>
                    <span class="text-base"><Icon icon="mdi:thumbs-up-down" /></span>
                  </button>
                {/if}

                <hr class="my-3" />
              </article>
            {/each}
          {/if}

          {#each newAnswers as newAnswer, index}
            {#if newAnswer.questionId === question.id}
              <div class="flex w-full m-3">
                <Input
                  id="answer-{index}"
                  label="Answer"
                  bind:value={newAnswer.text}
                  disabled={loading}
                />

                <div class="mt-9">
                  <button
                    class="btn btn-sm variant-filled-primary ml-3"
                    disabled={loading}
                    on:click={() => publishAnswer(index)}
                    type="button"
                  >
                    <span>Publish</span>
                  </button>
                </div>
              </div>
            {/if}
          {/each}

          {#if isOrganizer || isAttendee}
            <button
              class="btn btn-sm variant-filled-tertiary ml-3"
              disabled={loading}
              on:click={() => draftAnswer(question.id)}
              type="button"
            >
              Draft answer
            </button>
          {/if}
        </section>
      </article>
    {/each}
  </div>
</div>
