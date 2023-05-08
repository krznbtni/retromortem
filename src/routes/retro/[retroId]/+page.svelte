<script lang="ts">
import type {PageData} from './$types';
import {onDestroy, onMount} from 'svelte';
import {
  Collections,
  type QuestionsResponse,
  type RetrospectivesResponse,
  type UsersResponse,
} from '$lib/types/pocketbase-types';
import {pb} from '$lib/pocketbase';

interface Expanded extends RetrospectivesResponse {
  expand: {
    organizer: UsersResponse;
    attendees: Array<UsersResponse>;
    questions: Array<QuestionsResponse>;
  };
}

export let data: PageData;

let loading = false;
let unsubscribe: () => Promise<void>;

$: ({retro, isOrganizer, isAttendee} = data);

$: attendees = retro.expand.attendees || [];
$: questions = retro.expand.questions || [];

$: created = new Date(retro.created).toLocaleDateString('sv-SE');
$: updated = new Date(retro.updated).toLocaleString('sv-SE');
$: scheduled = retro.scheduled
  ? new Date(retro.scheduled).toLocaleString('sv-SE')
  : 'No scheduled date';

onMount(async () => {
  unsubscribe = await pb.collection(Collections.Retrospectives).subscribe(retro.id, ({action}) => {
    if (action === 'update') {
      void pb
        .collection(Collections.Retrospectives)
        .getOne<Expanded>(retro.id, {expand: 'organizer,attendees,questions.answers'})
        .then(res => (retro = res));
    }
  });
});

onDestroy(async () => {
  await unsubscribe?.();
});
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
    {/each}
  </form>
</div>
