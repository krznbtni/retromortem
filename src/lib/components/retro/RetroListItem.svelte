<script lang="ts">
import type {RetrospectivesResponse} from '$lib/types/pocketbase-types';

export let retro: RetrospectivesResponse;
</script>

<div class="bg-base-100 w-full flex items-center justify-between py-4">
  <div class="flex flex-col w-full h-full justify-center">
    <a href="/retro/{retro.id}" class="font-semibold text-lg hover:underline">{retro.name}</a>
  </div>
</div>
