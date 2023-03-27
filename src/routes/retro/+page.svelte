<script lang="ts">
import type {PageData} from './$types';

import RetroListItem from '$lib/components/retro/RetroListItem.svelte';

export let data: PageData;
</script>

<h2 class="text-3xl font-bold">My Retros</h2>

<div class="w-full mt-4 flex flex-col items-center">
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
</div>
