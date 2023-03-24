<script lang="ts">
import {page} from '$app/stores';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=random';

$: isLoggedIn = $page.data.user;

let isToggled = false;

function toggleDropdown(): void {
  isToggled = !isToggled;
}
</script>

<nav class="navbar bg-base-100">
  <div class="flex-1">
    <a class="btn btn-ghost normal-case text-xl" href="/">RetroMortem</a>
  </div>

  {#if isLoggedIn}
    <div class="flex-none">
      <div class="dropdown dropdown-end">
        <button class="btn btn-ghost btn-circle avatar" on:click={toggleDropdown}>
          <div class="w-10 rounded-full">
            <img src={AVATAR_PLACEHOLDER} alt="Profile avatar" />
          </div>
        </button>

        {#if isToggled}
          <ul
            class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a class="justify-between" href="/profile">Profile</a>
            </li>

            <li>
              <form action="/api/logout" method="POST">
                <button class="w-full text-start" type="submit">Log out</button>
              </form>
            </li>
          </ul>
        {/if}
      </div>
    </div>
  {:else}
    <a class="btn btn-outline" href="/login">Log in</a>
  {/if}
</nav>
