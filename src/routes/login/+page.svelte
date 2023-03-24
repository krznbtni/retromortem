<script lang="ts">
import {browser} from '$app/environment';
import type {OAuthLink} from '$lib/types/oauth';
import type {PageData} from './$types';

export let data: PageData;

$: oauthLinks = data.oauthLinks;
$: noLinks = oauthLinks.length === 0;

function gotoAuthProvider(oauthLink: OAuthLink) {
  if (browser) {
    document.cookie = `state=${oauthLink.state};`;
    document.cookie = `name=${oauthLink.name};`;
  }

  window.location.href = oauthLink.href;
}
</script>

{#if noLinks}
  <h2>Awwwwwwwww, no OAuthLinks</h2>
{:else}
  {#each oauthLinks as oauthLink (oauthLink.name)}
    <button on:click={() => gotoAuthProvider(oauthLink)}>{`Login with ${oauthLink.name}`}</button>
  {/each}
{/if}
