<script lang="ts">
import {browser} from '$app/environment';
import type {OAuthLink} from '$lib/types/oauth';
import type {PageData} from './$types';

export let data: PageData;

$: oauthLinks = data.oauthLinks;

function gotoAuthProvider(oauthLink: OAuthLink) {
  if (browser) {
    document.cookie = `state=${oauthLink.state};`;
    document.cookie = `name=${oauthLink.name};`;
  }

  window.location.href = oauthLink.href;
}
</script>

<div class="card w-96 bg-base-100 shadow-xl mx-auto my-16">
  <div class="card-body items-center text-center">
    <h2 class="card-title">Hey cutie! Log in below</h2>

    <div class="card-actions">
      {#each oauthLinks as oauthLink (oauthLink.name)}
        <button class="btn" on:click={() => gotoAuthProvider(oauthLink)}>
          Log in with {oauthLink.name}
        </button>
      {/each}
    </div>
  </div>
</div>
