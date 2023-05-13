<script lang="ts">
import type {PageData} from './$types';

import RetroListItem from '$lib/components/retro/RetroListItem.svelte';
import {onDestroy, onMount} from 'svelte';
import {pb} from '$lib/pocketbase';
import {fetchUsersRetros} from '$lib/fetch-users-retros';
import {page} from '$app/stores';
import {Collections} from '$lib/types/pocketbase-types';

export let data: PageData;

$: ({retros} = data);

let retrosUnsubscribe: () => Promise<void>;

onMount(async () => {
  retrosUnsubscribe = await pb.collection(Collections.Retrospectives).subscribe('*', () => {
    if ($page.data.user?.id) {
      void fetchUsersRetros(pb, $page.data.user?.id).then(res => (retros = res));
    }
  });
});

onDestroy(async () => {
  await retrosUnsubscribe?.();
});
</script>

<div class="container p-10 space-y-4">
  <h1 class="text-center">My Retros</h1>
  <hr />

  <div class="m-auto w-full max-w-lg">
    <ul class="list">
      {#each retros as retro}
        <RetroListItem {retro} />
        <hr />
      {/each}
    </ul>
  </div>

  <!-- <div class="w-full mt-4 flex flex-col items-center">
    {#if data.retros.length === 0}
      <p class="text-center text-3xl">☹️</p>
      <p class="text-center text-3xl">No retrospectives found, friend.</p>
      <a href="/retro/create" class="btn btn-primary max-w-md mt-4">Add One</a>
    {:else}
      <div class="flex flex-col w-full max-w-screen-sm">
        <div class="divider m-0" />

        {#each data.retros as retro}
          <RetroListItem {retro} />
          <div class="divider m-0" />
        {/each}
      </div>
    {/if}
  </div> -->
</div>
