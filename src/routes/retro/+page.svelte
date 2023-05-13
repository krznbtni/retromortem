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

  {#if retros.length === 0}
    <div class="card text-center pb-3 lg:w-1/2 m-auto">
      <header class="card-header text-xl">☹️ No retrospectives found, friend... ☹️</header>

      <section class="text-xl">
        <a href="/retro/create">Add One</a>
      </section>
    </div>
  {:else}
    <div class="m-auto w-full max-w-lg">
      <ul class="list">
        {#each retros as retro}
          <RetroListItem {retro} />
          <hr />
        {/each}
      </ul>
    </div>
  {/if}
</div>
