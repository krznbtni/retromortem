<script lang="ts">
import {page} from '$app/stores';
import {drawerStore} from '@skeletonlabs/skeleton';

$: isLoggedIn = $page.data.user;

function drawerClose(): void {
  drawerStore.close();
}
</script>

<nav class="list-nav p-4">
  <ul>
    <li><a href="/">Homepage</a></li>

    {#if isLoggedIn}
      <li>
        <a href="/retro" on:click={drawerClose}>Retro list</a>
      </li>

      <li>
        <a href="/retro/create" on:click={drawerClose}>Create Retro</a>
      </li>

      <hr />
      <li>
        <form action="/api/logout" method="POST">
          <button class="w-full" type="submit">Log out</button>
        </form>
      </li>
    {:else}
      <hr />
      <li>
        <a href="/login" on:click={drawerClose}>Log in</a>
      </li>
    {/if}
  </ul>
</nav>
