<script lang="ts">
import {browser} from '$app/environment';
import type {OAuthLink} from '$lib/types/oauth';
import type {PageData} from './$types';

export let data: PageData;

let loading = false;

$: oauthLinks = data.oauthLinks;

function gotoAuthProvider(oauthLink: OAuthLink) {
  if (loading) {
    return;
  }

  loading = true;

  if (browser) {
    document.cookie = `state=${oauthLink.state};`;
    document.cookie = `name=${oauthLink.name};`;
  }

  window.location.href = oauthLink.href;
}
</script>

<div class="card max-w-sm bg-base-100 shadow-xl mx-auto my-16">
  <div class="card-body items-center text-center">
    <h2 class="card-title mb-4">Hey cutie! Sign in below</h2>

    <div class="flex flex-col card-actions w-full">
      {#each oauthLinks as oauthLink (oauthLink.name)}
        <button class="btn w-full" class:loading on:click={() => gotoAuthProvider(oauthLink)}>
          Sign in with {oauthLink.name}
        </button>
      {/each}
    </div>
  </div>
</div>
