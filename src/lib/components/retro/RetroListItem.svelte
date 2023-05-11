<script lang="ts">
import type {CollectionResponses} from '$lib/types/pocketbase-types';

export let retro: CollectionResponses['retrospectives'];

$: created = new Date(retro.created).toLocaleDateString('sv-SE');
</script>

<a href="/retro/{retro.id}">
  <li>
    <span class="flex-auto">{retro.title}</span>
    <span class="text-xs">({created})</span>
  </li>
</a>
