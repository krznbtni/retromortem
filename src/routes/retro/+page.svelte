<script lang="ts">
import {onDestroy, onMount} from 'svelte';
import {page} from '$app/stores';
import type {PageData} from './$types';

import Icon from '@iconify/svelte';

import {Collections} from '$lib/types/pocketbase-types';
import {fetchUsersRetros} from '$lib/fetch-users-retros';
import {pb} from '$lib/pocketbase';

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
    <nav class="list-nav max-w-lg m-auto">
      <ul>
        {#each retros as retro (retro.id)}
          <li>
            <a href="/retro/{retro.id}">
              <span class="badge bg-primary-500">
                {#if retro.state === 'draft'}
                  <Icon icon="mdi:file" />
                {:else if retro.state === 'published'}
                  <Icon icon="mdi:calendar-clock" />
                {:else if retro.state === 'finished'}
                  <Icon icon="mdi:check" />
                {/if}
              </span>

              <span class="flex-auto">{retro.title}</span>
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</div>
