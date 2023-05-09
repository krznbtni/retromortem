<script lang="ts">
import {enhance, type SubmitFunction} from '$app/forms';
import {browser, dev} from '$app/environment';
import Input from '$lib/components/common/Input.svelte';

import type {OAuthLink} from '$lib/types/oauth';
import type {ActionData, PageData} from './$types';

export let form: ActionData;
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

const submitLogin = (() => {
  loading = true;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async ({result, update}) => {
    switch (result.type) {
      case 'success':
        await update();
        break;
      case 'failure':
        await update();
        break;
      case 'error':
        break;
      default:
        await update();
        break;
    }

    loading = false;
  };
}) satisfies SubmitFunction;
</script>

<div class="card max-w-sm bg-base-100 shadow-xl mx-auto my-16">
  <div class="card-body items-center text-center">
    <h2 class="card-title mb-4">Hey cutie! Sign in below</h2>

    <!-- Temporary because: layzee -->
    {#if dev}
      <form
        action="?/login"
        method="POST"
        class="flex flex-col space-y-2 w-full items-center"
        use:enhance={submitLogin}
      >
        <Input
          id="email"
          label="Email"
          type="email"
          value={form?.data?.email ?? ''}
          required
          disabled={loading}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={form?.data?.password}
          required
          disabled={loading}
        />

        <div class="w-full max-w-lg pt-3">
          <button class="btn btn-primary w-full max-w-lg" type="submit" disabled={loading}
            >Log in</button
          >
        </div>
      </form>
    {/if}

    <div class="flex flex-col card-actions w-full">
      {#each oauthLinks as oauthLink (oauthLink.name)}
        <button class="btn w-full" class:loading on:click={() => gotoAuthProvider(oauthLink)}>
          Sign in with {oauthLink.name}
        </button>
      {/each}
    </div>
  </div>
</div>
