<script lang="ts">
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
$: questions = retro.expand.questions || [];
$: allAnswerIds = questions.map(question => question.answers).flat();

$: created = new Date(retro.created).toLocaleDateString('sv-SE');
$: updated = new Date(retro.updated).toLocaleString('sv-SE');
$: scheduled = retro.scheduled
  ? new Date(retro.scheduled).toLocaleString('sv-SE')
  : 'No scheduled date';

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
</script>

<div class="w-full mt-4 flex flex-col items-center">
  <form class="flex flex-col w-full max-w-screen-sm" method="POST">
    <h2 class="text-3xl font-bold mb-4">{retro.title}</h2>

    <p class="text-sm mb-2"><strong>Organizer:</strong> {retro.expand.organizer.username}</p>
    <p class="text-sm mb-2"><strong>Created:</strong> {created}</p>
    <p class="text-sm mb-2"><strong>Updated:</strong> {updated}</p>
    <p class="text-sm mb-2"><strong>Scheduled:</strong> {scheduled}</p>

    {#if retro.details}
      <p class="text-sm mb-4"><strong>Details:</strong> {retro.details}</p>
    {/if}

    <h3 class="text-2xl font-bold mb-4">
      Participants

      {#if !isOrganizer && !isAttendee}
        <button
          formaction="?/joinRetro"
          class:btn-disabled={loading}
          class:loading
          class="btn btn-accent btn-xs gap-1 ml-4"
        >
          {#if !loading}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          {/if}
          ? JOIN ?
          {#if !loading}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          {/if}
        </button>
      {/if}

      {#if !isOrganizer && isAttendee}
        <button
          formaction="?/leaveRetro"
          class:btn-disabled={loading}
          class:loading
          class="btn btn-warning btn-xs gap-1 ml-4"
        >
          {#if !loading}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          {/if}
          ? LEAVE ?
          {#if !loading}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          {/if}
        </button>
      {/if}
    </h3>

    <div class="flex flex-wrap gap-3 mb-4">
      {#if !attendees.length}
        <p class="text-sm mb-2">lol u has no friends?</p>
      {/if}

      {#each attendees as attendee}
        <div class="badge badge-lg badge-outline">{attendee.name}</div>
      {/each}
    </div>

    <h3 class="text-2xl font-bold mb-4">Questions</h3>

    {#each questions as question}
      <h4 class="text-md font-bold mb-4">{question.title}</h4>

      {#if question.expand.answers}
        {#each question.expand.answers as answer}
          <p class="text-sm-mb-2">
            <strong>Creator:</strong>
            {answer.expand.creator.username || answer.expand.creator.email}
          </p>
          <p class="text-sm-mb-2"><strong>Text:</strong> {answer.text}</p>
          <p class="text-sm-mb-2">
            <strong>Votes:</strong>

            {#if answer.expand.votes}
              {#each answer.expand.votes as vote}
                <div class="badge badge-lg badge-outline">
                  {vote.expand.user.name || vote.expand.user.username}
                </div>
              {/each}
            {/if}
          </p>

          {#if hasVotedForAnswer(answer.expand.votes)}
            <button
              class:btn-disabled={loading}
              class:loading
              class="btn btn-accent btn-xs gap-1 mb-2"
              on:click={() => removeVote(answer)}
              type="button"
            >
              Remove vote
            </button>
          {:else}
            <button
              class:btn-disabled={loading}
              class:loading
              class="btn btn-accent btn-xs gap-1 mb-2"
              on:click={() => addVote(answer)}
              type="button"
            >
              Add vote
            </button>
          {/if}
        {/each}
      {/if}

      {#each newAnswers as newAnswer, index}
        {#if newAnswer.questionId === question.id}
          <Input
            id="answer-{index}"
            label="Answer"
            bind:value={newAnswer.text}
            disabled={loading}
          />
          <button
            class:btn-disabled={loading}
            class:loading
            class="btn btn-accent btn-xs gap-1 mb-2"
            on:click={() => publishAnswer(index)}
            type="button"
          >
            Publish
          </button>
        {/if}
      {/each}

      <button
        class:btn-disabled={loading}
        class:loading
        class="btn btn-accent btn-xs gap-1"
        on:click={() => draftAnswer(question.id)}
        type="button"
      >
        Add draft
      </button>
    {/each}
  </form>
</div>
