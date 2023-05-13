<script lang="ts">
import {onDestroy, onMount} from 'svelte';
import type {PageData} from './$types';
import {enhance, type SubmitFunction} from '$app/forms';
import {goto} from '$app/navigation';

import {modalStore, type ModalSettings, InputChip, Autocomplete} from '@skeletonlabs/skeleton';
import Icon from '@iconify/svelte';

import {Collections, type ActionsResponse, type AnswersResponse} from '$lib/types/pocketbase-types';
import {debounce} from '$lib/debounce';
import {fetchRetro} from '$lib/fetch-retro';
import {Input, EditActionModal, EditAnswerModal} from '$lib/components';
import {isTrueObject} from '$lib/is-true-object';
import {pb} from '$lib/pocketbase';
import type {ExpandedVotes, ExpandedAnswers, ExpandedRetrospective} from './+page.server';
import type {UsersResponse} from '$lib/types/pocketbase-types';

export let data: PageData;

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

function refetchRetro(): Promise<ExpandedRetrospective> {
  return fetchRetro<ExpandedRetrospective>(
    pb,
    retro.id,
    'organizer,attendees,questions.answers.creator,questions.answers.votes,questions.answers.votes.user,actions.assignees',
  );
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

  inputChipList = attendees
    .map(attendee => attendee.username)
    .filter(username => username !== retro.expand.organizer.username);
});

onDestroy(async () => {
  await retrosUnsubscribe?.();
  await questionsUnsubscribe?.();
  await answersUnsubscribe?.();
  await actionsUnsubscribe?.();
});

interface NewAction {
  text: string;
  assignees: Array<string>;
}

interface NewAnswer {
  questionId: string;
  text: string;
}

let newActions: Array<NewAction> = [];
let newAnswers: Array<NewAnswer> = [];

function draftAnswer(questionId: string): void {
  newAnswers = [...newAnswers, {questionId, text: ''}];
}

function draftAction(): void {
  newActions = [...newActions, {assignees: [], text: ''}];
}

async function publishAnswer(index: number): Promise<void> {
  const newAnswer = newAnswers[index];

  await fetch('/api/retro/answers', {
    method: 'POST',
    body: JSON.stringify({...newAnswer, retroId: retro.id}),
    headers: {'Content-Type': 'application/json'},
  });

  newAnswers = newAnswers.filter((_, i) => i !== index);
}

async function publishAction(index: number): Promise<void> {
  const newAction = newActions[index];

  await fetch(`/api/retro/${retro.id}/actions`, {
    method: 'POST',
    body: JSON.stringify(newAction),
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

  await fetch(`/api/retro/${retro.id}/answers/${answer.id}/vote`, {
    method: 'POST',
  });
}

async function removeVote(answer: ExpandedAnswers): Promise<void> {
  if (!hasVotedForAnswer(answer.expand.votes)) {
    return;
  }

  await fetch(`/api/retro/${retro.id}/answers/${answer.id}/vote`, {
    method: 'DELETE',
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

let isEditingActions: Record<string, ActionsResponse> = {};

function showEditAnswerModal(answerIn: AnswersResponse): void {
  const modal: ModalSettings = {
    type: 'component',
    component: {
      ref: EditAnswerModal,
      props: {
        loading,
        answer: answerIn,
      },
    },
    response: (answerOut: AnswersResponse) => {
      void updateAnswer(answerOut);
    },
  };

  modalStore.trigger(modal);
}

function showEditActionModal(actionIn: ActionsResponse): void {
  const modal: ModalSettings = {
    type: 'component',
    component: {
      ref: EditActionModal,
      props: {
        loading,
        action: actionIn,
        assigneeRecord,
      },
    },
    response: (actionOut: ActionsResponse) => {
      void updateAction(actionOut);
    },
  };

  modalStore.trigger(modal);
}

async function updateAnswer(answer: AnswersResponse): Promise<void> {
  loading = true;

  await fetch(`/api/retro/answers/${answer.id}`, {
    method: 'PUT',
    body: JSON.stringify({text: answer.text}),
    headers: {'Content-Type': 'application/json'},
  });

  loading = false;
}

async function updateAction(action: ActionsResponse | undefined): Promise<void> {
  if (!action) {
    return;
  }

  loading = true;

  const x = assigneeRecord[action.id];

  if (isTrueObject(x)) {
    const allMembers = [retro.expand.organizer, ...retro.expand.attendees];
    const selectedUsernames = Object.keys(x).filter(f => x[f]);

    const selectedIds = allMembers
      .filter(member => selectedUsernames.includes(member.username))
      .map(member => member.id);
    action.assignees = selectedIds;

    await fetch(`/api/actions/${action.id}`, {
      method: 'PUT',
      body: JSON.stringify(action),
      headers: {'Content-Type': 'application/json'},
    });
  }

  loading = false;
}

function showDeleteAnswerModal(answer: AnswersResponse): void {
  loading = true;

  const modal: ModalSettings = {
    type: 'confirm',
    title: 'Please Confirm',
    body: 'Are you sure you wish to delete your answer?',
    // TRUE if confirm pressed, FALSE if cancel pressed
    response: (r: boolean) => {
      if (r) {
        void fetch(`/api/retro/answers/${answer.id}`, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
        });
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
        void fetch(`/api/actions/${id}`, {
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

$: assigneeRecord = retro.expand.actions?.reduce((prev, curr) => {
  const {assignees, id} = curr;

  const allMembers = [retro.expand.organizer, ...(retro.expand.attendees || [])];

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

let inputChip = '';
let inputChipList: Array<string> = [];

// $: {
//   inputChipList = attendees
//     .map(attendee => attendee.username)
//     .filter(username => username !== retro.expand.organizer.username);
// }

let autocompleteOptions: Array<{label: string; value: string}> = [];

async function onInputChipSelect(
  event: CustomEvent<{label: string; value: string}>,
): Promise<void> {
  inputChipList = [...inputChipList, event.detail.label];
  retro.attendees?.push(event.detail.value);
  retro.attendees = [...retro.attendees];
  await pb.collection(Collections.Retrospectives).update(retro.id, retro);
  await updateAutocompleteOptions(inputChip);
}

async function onChipClick(event: Event): Promise<void> {
  let username = '';

  if (event instanceof MouseEvent) {
    if (event.target instanceof HTMLButtonElement) {
      if (typeof event.target.textContent === 'string') {
        username = event.target.textContent.split(' ')[0] ?? '';
        inputChipList = inputChipList.filter(chip => chip !== username);
      }
    } else if (event.target instanceof HTMLSpanElement) {
      if (typeof event.target.parentElement?.textContent === 'string') {
        username = event.target.parentElement?.textContent.split(' ')[0] ?? '';
        inputChipList = inputChipList.filter(chip => chip !== username);
      }
    }
  }

  const attendee = attendees.find(attendee => attendee.username === username);

  if (attendee) {
    retro.attendees = retro.attendees.filter(id => id !== attendee.id);
    await pb.collection(Collections.Retrospectives).update(retro.id, retro);
  }
}

async function updateAutocompleteOptions(val: string): Promise<void> {
  if (!val.length) {
    autocompleteOptions = [];
    return;
  }

  const list = await pb.collection(Collections.Users).getFullList<UsersResponse>({
    filter: `id != "${retro.organizer}" && username ~ "${val}"`,
  });

  autocompleteOptions = list
    .map(user => ({
      label: user.username,
      value: user.id,
    }))
    .filter(user => !val.includes(user.label))
    .filter(user => !inputChipList.includes(user.label));

  autocompleteOptions = [...autocompleteOptions];
}

const handleSomething = debounce(updateAutocompleteOptions, 100);

$: handleSomething(inputChip);
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

  <InputChip
    bind:input={inputChip}
    bind:value={inputChipList}
    name="attendee-chips"
    on:click={onChipClick}
  />

  {#if inputChip.length}
    <div class="card w-full max-h-48 p-4 overflow-y-auto">
      {#key autocompleteOptions}
        <Autocomplete
          bind:input={inputChip}
          options={autocompleteOptions}
          denylist={inputChipList}
          on:selection={onInputChipSelect}
        />
      {/key}
    </div>
  {/if}

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
                      on:click={() => showEditAnswerModal(answer)}
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
                      on:click={() => showDeleteAnswerModal(answer)}
                    >
                      <span>
                        <Icon icon="mdi:delete-forever" />
                      </span>
                    </button>
                  {/if}
                </section>

                <p><strong>Text:</strong> {answer.text}</p>

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

                {#if isOrganizer || isAttendee}
                  {#if hasVotedForAnswer(answer.expand.votes)}
                    <button
                      class="btn btn-sm variant-filled-warning mt-2"
                      disabled={loading}
                      type="button"
                      on:click={() => removeVote(answer)}
                    >
                      <span>Remove vote</span>
                      <span class="text-base"><Icon icon="mdi:thumbs-up-down" /></span>
                    </button>
                  {:else}
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
          <p>
            <strong>State:</strong>
            {action.state}
          </p>

          {#if isOrganizer || isAttendee}
            <button
              class="btn btn-sm variant-filled-primary ml-auto"
              disabled={loading}
              type="button"
              on:click={() => showEditActionModal(action)}
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

        <p>
          <strong>Due:</strong>
          {action.due ? new Date(action.due).toLocaleString('sv-SE') : ''}
        </p>

        <p>
          <strong>Assignees:</strong>

          {#if action.expand.assignees}
            {#each action.expand.assignees as assignee}
              <span class="badge variant-filled">{assignee.username}</span>
            {/each}
          {/if}
        </p>

        <p><strong>Text:</strong> {action.text}</p>
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
