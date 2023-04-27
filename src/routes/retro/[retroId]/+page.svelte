<script lang="ts">
import {enhance, type SubmitFunction} from '$app/forms';
import {invalidateAll} from '$app/navigation';
import type {PageData} from './$types';

export let data: PageData;

let loading = false;

$: ({retro, questions, isOrganizer, isParticipant} = data);

$: participants = retro.expand.participants || [];

$: created = new Date(retro.created).toLocaleDateString('sv-SE');
$: updated = new Date(retro.updated).toLocaleString('sv-SE');
$: scheduled = retro.scheduled
  ? new Date(retro.scheduled).toLocaleString('sv-SE')
  : 'No scheduled date';

const submitJoinRetro = (() => {
  if (loading) {
    return;
  }

  loading = true;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async ({result, update}) => {
    switch (result.type) {
      case 'success':
        await invalidateAll();
        break;
      case 'error':
        break;
      default:
        await update();
    }

    loading = false;
  };
}) satisfies SubmitFunction;
</script>

<div class="w-full mt-4 flex flex-col items-center">
  <form class="flex flex-col w-full max-w-screen-sm" method="POST" use:enhance={submitJoinRetro}>
    <h2 class="text-3xl font-bold mb-4">{retro.name}</h2>

    <p class="text-sm mb-2"><strong>Organizer:</strong> {retro.expand.organizer.username}</p>
    <p class="text-sm mb-2"><strong>Created:</strong> {created}</p>
    <p class="text-sm mb-2"><strong>Updated:</strong> {updated}</p>
    <p class="text-sm mb-2"><strong>Scheduled:</strong> {scheduled}</p>

    {#if retro.description}
      <p class="text-sm mb-4"><strong>Description:</strong> {retro.description}</p>
    {/if}

    <h3 class="text-2xl font-bold mb-4">
      Participants

      {#if !isOrganizer && !isParticipant}
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
        </button>
      {/if}
    </h3>

    <div class="flex flex-wrap gap-3 mb-4">
      {#if !participants.length}
        <p class="text-sm mb-2">lol u has no friends?</p>
      {/if}

      {#each participants as participant}
        <div class="badge badge-lg badge-outline">{participant.name}</div>
      {/each}
    </div>

    <h3 class="text-2xl font-bold mb-4">Questions</h3>

    {#each questions as question}
      <h4 class="text-md font-bold mb-4">{question.title}</h4>
    {/each}
  </form>
</div>