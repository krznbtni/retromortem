<script lang="ts">
import type {PageData} from './$types';

export let data: PageData;

$: ({retro, questions} = data);

$: participants = retro.expand.participants;

$: created = new Date(retro.created).toLocaleDateString('sv-SE');
$: updated = new Date(retro.updated).toLocaleString('sv-SE');
$: scheduled = retro.scheduled
  ? new Date(retro.scheduled).toLocaleString('sv-SE')
  : 'No scheduled date';
</script>

<div class="w-full mt-4 flex flex-col items-center">
  <div class="flex flex-col w-full max-w-screen-sm">
    <h2 class="text-3xl font-bold mb-4">{retro.name}</h2>

    <p class="text-sm mb-2"><strong>Organizer:</strong> {retro.expand.organizer.username}</p>
    <p class="text-sm mb-2"><strong>Created:</strong> {created}</p>
    <p class="text-sm mb-2"><strong>Updated:</strong> {updated}</p>
    <p class="text-sm mb-2"><strong>Scheduled:</strong> {scheduled}</p>

    {#if retro.description}
      <p class="text-sm mb-4"><strong>Description:</strong> {retro.description}</p>
    {/if}

    <h3 class="text-2xl font-bold mb-4">Participants</h3>

    <div class="flex flex-wrap gap-3 mb-4">
      {#each participants as participant}
        <div class="badge badge-lg badge-outline">{participant.name}</div>
      {/each}
    </div>

    <h3 class="text-2xl font-bold mb-4">Questions</h3>

    {#each questions as question}
      <h4 class="text-xl font-bold mb-4">{question.title}</h4>
    {/each}
  </div>
</div>
