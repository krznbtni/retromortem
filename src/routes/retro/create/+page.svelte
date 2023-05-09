<script lang="ts">
import {applyAction, enhance, type SubmitFunction} from '$app/forms';
import {invalidateAll} from '$app/navigation';

import Input from '$lib/components/common/Input.svelte';
import RetroQuestions from '$lib/components/retro/RetroQuestions.svelte';
import Select from '$lib/components/common/Select.svelte';
import TextArea from '$lib/components/common/TextArea.svelte';

import type {ActionData} from './$types';

export let form: ActionData;

let loading = false;
let states = ['draft', 'published'];
let questions: Array<string> = [];

const submitCreateRetro = (({data}) => {
  if (loading) {
    return;
  }

  loading = true;
  data.append('questionsIn', JSON.stringify(questions));

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async ({result}) => {
    switch (result.type) {
      case 'success':
        await invalidateAll();
        break;
      case 'error':
        break;
      default:
        await applyAction(result);
        break;
    }

    loading = false;
  };
}) satisfies SubmitFunction;
</script>

<div class="container p-10 space-y-4">
  <h1 class="text-center">Create Retro</h1>
  <hr />

  <form
    action="?/create"
    method="POST"
    class="flex flex-col items-center"
    use:enhance={submitCreateRetro}
  >
    <Input id="title" label="Title" value={form?.data?.title} required disabled={loading} />
    <TextArea id="details" label="Details" value={form?.data?.details} disabled={loading} />
    <Select
      id="state"
      label="State"
      value={form?.data?.state}
      options={states}
      required
      disabled={loading}
    />
    <Input
      id="dateTime"
      label="Date and time"
      value={form?.data?.dateTime}
      required
      disabled={loading}
      type="datetime-local"
    />

    <RetroQuestions bind:questions {loading} />

    <div class="w-full max-w-lg">
      <button type="submit" class="btn variant-filled-primary w-full max-w-lg" disabled={loading}
        >Create Retro</button
      >
    </div>
  </form>
</div>
