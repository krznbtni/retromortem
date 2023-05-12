<script lang="ts">
import Icon from '@iconify/svelte';

import type {PageData} from './$types';
import {onDestroy, onMount} from 'svelte';
import {
  Collections,
  type ActionsResponse,
  type AnswersResponse,
  type QuestionsResponse,
  type RetrospectivesResponse,
  type UsersResponse,
  type VotesResponse,
  ActionsStateOptions,
} from '$lib/types/pocketbase-types';
import {pb} from '$lib/pocketbase';
import {Input, Select} from '$lib/components';
import {enhance, type SubmitFunction} from '$app/forms';
import {modalStore, type ModalSettings} from '@skeletonlabs/skeleton';
import {goto} from '$app/navigation';

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

interface ExpandedAction extends ActionsResponse {
  expand: {
    assignees: Array<UsersResponse>;
  };
}

interface ExpandedRetrospective extends RetrospectivesResponse {
  expand: {
    organizer: UsersResponse;
    attendees: Array<UsersResponse>;
    questions: Array<ExpandedQuestion>;
    actions: Array<ExpandedAction>;
  };
}

export let data: PageData;

let actionStates = Object.values(ActionsStateOptions);
let loading = false;
let retrosUnsubscribe: () => Promise<void>;
let questionsUnsubscribe: () => Promise<void>;
let answersUnsubscribe: () => Promise<void>;
let actionsUnsubscribe: () => Promise<void>;

$: ({retro, isOrganizer, isAttendee, userId} = data);

$: actions = retro.expand.actions || [];
$: attendees = retro.expand.attendees || [];
$: questions =
  retro.expand.questions?.sort((a, b) => +new Date(a.created) - +new Date(b.created)) || [];

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
      'organizer,attendees,questions.answers.creator,questions.answers.votes,questions.answers.votes.user,actions.assignees',
  });
}

onMount(async () => {
  retrosUnsubscribe = await pb
    .collection(Collections.Retrospectives)
    .subscribe(retro.id, ({action}) => {
      if (action === 'update') {
        void refetchRetro().then(res => (retro = res));
      } else if (action === 'delete') {
        void goto('/retro');
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

  actionsUnsubscribe = await pb.collection(Collections.Actions).subscribe('*', ({record}) => {
    if (retro.actions.includes(record.id)) {
      void refetchRetro().then(res => (retro = res));
    }
  });
});

onDestroy(async () => {
  await retrosUnsubscribe?.();
  await questionsUnsubscribe?.();
  await answersUnsubscribe?.();
  await actionsUnsubscribe?.();
});

interface NewAnswer {
  questionId: string;
  text: string;
}

let newAnswers: Array<NewAnswer> = [];

function draftAnswer(questionId: string): void {
  newAnswers = [...newAnswers, {questionId, text: ''}];
}

interface NewAction {
  text: string;
  assignees: Array<string>;
}

let newActions: Array<NewAction> = [];

function draftAction(): void {
  newActions = [...newActions, {assignees: [], text: ''}];
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

async function publishAction(index: number): Promise<void> {
  const newAction = newActions[index];

  await fetch('/api/retro/actions/publish', {
    method: 'POST',
    body: JSON.stringify({...newAction, retroId: retro.id}),
    headers: {'Content-Type': 'application/json'},
  });

  newActions = newActions.filter((_, i) => i !== index);
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
let isEditingActions: Record<string, ActionsResponse> = {};

function setIsEditingAnswer({id, text}: {id: string; text: string}): void {
  if (id in isEditingAnswers) {
    delete isEditingAnswers[id];
    isEditingAnswers = {...isEditingAnswers};
  } else {
    isEditingAnswers[id] = text;
  }
}

function setIsEditingAction(action: ActionsResponse): void {
  if (action.id in isEditingActions) {
    delete isEditingActions[action.id];
    isEditingActions = {...isEditingActions};
  } else {
    isEditingActions[action.id] = action;
  }
}

async function updateAnswer(id: string): Promise<void> {
  loading = true;

  await fetch(`/api/retro/answers/${id}`, {
    method: 'PUT',
    body: JSON.stringify({text: isEditingAnswers[id]}),
    headers: {'Content-Type': 'application/json'},
  });

  delete isEditingAnswers[id];
  isEditingAnswers = {...isEditingAnswers};

  loading = false;
}

async function updateAction(id: string): Promise<void> {
  loading = true;

  const allMembers = [retro.expand.organizer, ...retro.expand.attendees];
  const selectedUserames = Object.keys(assigneeRecord[id]).filter(f => assigneeRecord[id][f]);
  const selectedIds = allMembers
    .filter(member => selectedUserames.includes(member.username))
    .map(member => member.id);
  isEditingActions[id].assignees = selectedIds;

  await fetch(`/api/retro/actions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(isEditingActions[id]),
    headers: {'Content-Type': 'application/json'},
  });

  delete isEditingActions[id];
  isEditingActions = {...isEditingActions};

  loading = false;
}

function deleteAnswer(id: string): void {
  loading = true;

  const modal: ModalSettings = {
    type: 'confirm',
    title: 'Please Confirm',
    body: 'Are you sure you wish to delete your answer?',
    // TRUE if confirm pressed, FALSE if cancel pressed
    response: (r: boolean) => {
      if (r) {
        void fetch(`/api/retro/answers/${id}`, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
        });

        if (isEditingAnswers[id]) {
          delete isEditingAnswers[id];
          isEditingAnswers = {...isEditingAnswers};
        }
      }
      loading = false;
    },
  };

  modalStore.trigger(modal);
}

function deleteAction(id: string): void {
  loading = true;

  const modal: ModalSettings = {
    type: 'confirm',
    title: 'Please Confirm',
    body: 'Are you sure you wish to delete this action?',
    // TRUE if confirm pressed, FALSE if cancel pressed
    response: (r: boolean) => {
      if (r) {
        void fetch(`/api/retro/actions/${id}`, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
        });

        if (isEditingActions[id]) {
          delete isEditingActions[id];
          isEditingActions = {...isEditingActions};
        }
      }
      loading = false;
    },
  };

  modalStore.trigger(modal);
}

function deleteRetro(): void {
  loading = true;

  const modal: ModalSettings = {
    type: 'confirm',
    title: 'Please Confirm',
    body: 'Are you sure you wish to delete this retro?',
    // TRUE if confirm pressed, FALSE if cancel pressed
    response: (r: boolean) => {
      if (r) {
        void fetch(`/api/retro/${retro.id}`, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
        });
      }

      loading = false;
    },
  };

  modalStore.trigger(modal);
}

let assigneeRecord: Record<string, Record<string, boolean>>;

$: assigneeRecord = retro.expand.actions.reduce((prev, curr) => {
  const {assignees, id} = curr;
  const allMembers = [retro.expand.organizer, ...retro.expand.attendees];

  const x: Record<string, boolean> = allMembers.reduce(
    (prev2, curr2) => ({
      ...prev2,
      [curr2.username]: assignees.includes(curr2.id),
    }),
    {},
  );

  return {
    ...prev,
    [id]: x,
  };
}, {});
</script>

<div class="container p-10 space-y-4">
  <div class="flex flex-row items-center">
    <h1>{retro.title}</h1>

    {#if isOrganizer}
      <a href="/retro/{retro.id}/edit" class="ml-auto">
        <Icon icon="mdi:pencil" style="font-size: 1.5rem;" />
      </a>

      <button
        class="btn btn-sm variant-filled-error ml-3"
        disabled={loading}
        type="button"
        on:click={deleteRetro}
      >
        <span>
          <Icon icon="mdi:delete-forever" />
        </span>
      </button>
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
        <span class="badge variant-filled">{attendee.username}</span>
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
                <section class="flex items-center">
                  <p>
                    <strong>Creator:</strong>
                    {answer.expand.creator.username}
                  </p>

                  {#if answer.expand.creator.id === userId}
                    <button
                      class="btn btn-sm variant-filled-primary ml-auto"
                      disabled={loading}
                      type="button"
                      on:click={() => setIsEditingAnswer(answer)}
                    >
                      <span>
                        <Icon icon="mdi:pencil" />
                      </span>
                    </button>
                  {/if}

                  {#if answer.expand.creator.id === userId}
                    <button
                      class="btn btn-sm variant-filled-error ml-3"
                      disabled={loading}
                      type="button"
                      on:click={() => deleteAnswer(answer.id)}
                    >
                      <span>
                        <Icon icon="mdi:delete-forever" />
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

  <div class="flex w-full flex-col">
    <h2>Actions</h2>

    {#each actions as action, index (action.id)}
      <article
        class="m-3 border-l-4 pl-3"
        class:border-l-indigo-500={index % 2}
        class:border-l-yellow-500={!(index % 2)}
      >
        <section class="flex items-center">
          {#if !(action.id in isEditingActions)}
            <p>
              <strong>State:</strong>
              {action.state}
            </p>
          {:else}
            <Select
              id="action-state-{action.id}"
              label="State"
              bind:value={isEditingActions[action.id].state}
              options={actionStates}
              disabled={loading}
            />
          {/if}

          {#if isOrganizer || isAttendee}
            <button
              class="btn btn-sm variant-filled-primary ml-auto"
              disabled={loading}
              type="button"
              on:click={() => setIsEditingAction(action)}
            >
              <span>
                <Icon icon="mdi:pencil" />
              </span>
            </button>

            <button
              class="btn btn-sm variant-filled-error ml-3"
              disabled={loading}
              type="button"
              on:click={() => deleteAction(action.id)}
            >
              <span>
                <Icon icon="mdi:delete-forever" />
              </span>
            </button>
          {/if}
        </section>

        {#if !(action.id in isEditingActions)}
          <p>
            <strong>Due:</strong>
            {action.due ? new Date(action.due).toLocaleString('sv-SE') : ''}
          </p>
        {:else}
          <Input
            id="dateTime-{action.id}"
            label="Due"
            value={isEditingActions[action.id].due}
            disabled={loading}
            type="datetime-local"
            on:change={event => (isEditingActions[action.id].due = event.target.value)}
          />
        {/if}

        {#if !(action.id in isEditingActions)}
          <p>
            <strong>Assignees:</strong>
            {#if action.expand.assignees}
              {#each action.expand.assignees as assignee}
                <span class="badge variant-filled">{assignee.username}</span>
              {/each}
            {/if}
          </p>
        {:else}
          {#each Object.keys(assigneeRecord[action.id]) as f, index}
            <span
              class="chip {assigneeRecord[action.id][f] ? 'variant-filled' : 'variant-soft'}"
              class:ml-3={index !== 0}
              on:click={() => {
                assigneeRecord[action.id][f] = !assigneeRecord[action.id][f];
              }}
              on:keypress
            >
              <span>{f}</span>
            </span>
          {/each}
        {/if}

        {#if !(action.id in isEditingActions)}
          <p><strong>Text:</strong> {action.text}</p>
        {:else}
          <Input
            id="action-{action.id}"
            label="Action"
            bind:value={isEditingActions[action.id].text}
            disabled={loading}
          />
        {/if}

        {#if action.id in isEditingActions}
          <section class="flex mb-3">
            <button
              class="btn btn-sm variant-filled-primary"
              disabled={loading}
              on:click={() => updateAction(action.id)}
              type="button"
            >
              <span>Update</span>
            </button>

            <button
              class="btn btn-sm variant-filled-warning ml-3"
              disabled={loading}
              on:click={() => setIsEditingAction(action)}
              type="button"
            >
              <span>Cancel</span>
            </button>
          </section>
        {/if}
      </article>
    {/each}

    {#each newActions as newAction, index}
      <div class="flex w-full m-3">
        <Input id="action-{index}" label="Action" bind:value={newAction.text} disabled={loading} />

        <div class="mt-9">
          <button
            class="btn btn-sm variant-filled-primary"
            disabled={loading}
            on:click={() => publishAction(index)}
            type="button"
          >
            <span>Publish</span>
          </button>
        </div>
      </div>
    {/each}

    {#if isOrganizer || isAttendee}
      <button
        class="btn btn-sm variant-filled-tertiary"
        disabled={loading}
        on:click={draftAction}
        type="button"
      >
        Draft action
      </button>
    {/if}
  </div>
</div>
