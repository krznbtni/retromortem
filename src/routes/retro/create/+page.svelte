<script lang="ts">
import {applyAction, enhance, type SubmitFunction} from '$app/forms';
import {invalidateAll} from '$app/navigation';

import DatePicker from '$lib/components/common/DatePicker.svelte';
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
  data.append('questions', JSON.stringify(questions));

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

<div class="flex justify-center w-full h-full">
  <form
    action="?/create"
    method="POST"
    class="flex flex-col space-y-2 w-full items-center"
    use:enhance={submitCreateRetro}
  >
    <h3 class="text-3xl font-bold">Create Retro</h3>

    <Input id="name" label="Name" value={form?.data?.name} required disabled={loading} />
    <TextArea
      id="description"
      label="Description"
      value={form?.data?.description}
      disabled={loading}
    />
    <Select
      id="state"
      label="State"
      value={form?.data?.state}
      options={states}
      required
      disabled={loading}
    />
    <DatePicker id="date" label="Date" value={form?.data?.date} required disabled={loading} />
    <Input
      id="time"
      label="Time"
      value={form?.data?.time}
      required
      type="time"
      disabled={loading}
    />

    <RetroQuestions bind:questions {loading} />

    <div class="w-full max-w-lg pt-3">
      <button type="submit" class="btn btn-primary w-full max-w-lg" disabled={loading}
        >Create Retro</button
      >
    </div>
  </form>
</div>
