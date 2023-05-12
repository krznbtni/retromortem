<script lang="ts">
import {applyAction, enhance, type SubmitFunction} from '$app/forms';
import {goto, invalidateAll} from '$app/navigation';

import Input from '$lib/components/common/Input.svelte';
import RetroQuestions from '$lib/components/retro/RetroQuestions.svelte';
import Select from '$lib/components/common/Select.svelte';
import TextArea from '$lib/components/common/TextArea.svelte';
import {modalStore, type ModalSettings} from '@skeletonlabs/skeleton';

import type {ActionData, PageData} from './$types';

export let data: PageData;
export let form: ActionData;

$: ({retro} = data);

let loading = false;
let states = ['draft', 'published'];

let newQuestions: Array<string> = [];

$: currentQuestions = retro.expand.questions || [];

function handleDeletedCurrentQuestion(event: CustomEvent<number>): void {
  currentQuestions = currentQuestions.filter((_, i) => i !== event.detail);
}

const submitUpdateRetro = (({data}) => {
  if (loading) {
    return;
  }

  loading = true;
  data.append('newQuestions', JSON.stringify(newQuestions));
  data.append('updatedQuestions', JSON.stringify(currentQuestions));

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

function deleteRetro(): void {
  loading = true;

  const modal: ModalSettings = {
    type: 'confirm',
    title: 'Please Confirm',
    body: 'Are you sure you wish to delete this retro?',
    // TRUE if confirm pressed, FALSE if cancel pressed
    response: (r: boolean) => {
      if (r) {
        void fetch(`/api/retro/${retro.id}`, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
        }).then(() => {
          void goto('/retro');
        });
      }

      loading = false;
    },
  };

  modalStore.trigger(modal);
}
</script>

<div class="container p-10 space-y-4">
  <h1 class="text-center">Edit {retro.title}</h1>
  <hr />

  <form
    action="?/updateRetro"
    method="POST"
    class="flex flex-col items-center"
    use:enhance={submitUpdateRetro}
  >
    <Input
      id="title"
      label="Title"
      value={form?.data?.title ?? retro.title}
      required
      disabled={loading}
    />
    <TextArea
      id="details"
      label="Details"
      value={form?.data?.details ?? retro.details}
      disabled={loading}
    />
    <Select
      id="state"
      label="State"
      value={form?.data?.state ?? retro.state}
      options={states}
      required
      disabled={loading}
    />
    <Input
      id="dateTime"
      label="Date and time"
      value={form?.data?.dateTime ?? new Date(retro.scheduled).toLocaleString('sv-SE')}
      required
      disabled={loading}
      type="datetime-local"
    />

    <RetroQuestions
      bind:questions={newQuestions}
      bind:currentQuestions
      {loading}
      on:deletedCurrent={handleDeletedCurrentQuestion}
    />

    <div class="w-full max-w-lg">
      <button type="submit" class="btn variant-filled-primary w-full max-w-lg" disabled={loading}
        >Update Retro</button
      >

      <button
        class="btn variant-filled-error w-full max-w-lg"
        disabled={loading}
        on:click={deleteRetro}
        type="button"
      >
        Delete Retro
      </button>
    </div>
  </form>
</div>
