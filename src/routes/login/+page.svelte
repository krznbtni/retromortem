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

<div class="container p-10 space-y-4">
  <div class="card max-w-sm mx-auto my-16">
    <header class="card-header text-center">
      <h3>Hey cutie! Sign in below</h3>
    </header>

    <section class="p-4 space-y-4 items-center text-center">
      {#if dev}
        <div class="items-center text-center">
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
              <button class="btn w-full variant-filled" type="submit" disabled={loading}
                >Log in</button
              >
            </div>
          </form>
        </div>

        <hr />
      {/if}

      <div class="flex flex-col w-full">
        {#each oauthLinks as oauthLink (oauthLink.name)}
          <button
            type="button"
            class="btn w-full variant-filled"
            class:loading
            on:click={() => gotoAuthProvider(oauthLink)}
          >
            Sign in with {oauthLink.name}
          </button>
        {/each}
      </div>
    </section>
  </div>
</div>
