<script lang="ts">
import {applyAction, enhance, type SubmitFunction} from '$app/forms';
import {invalidateAll} from '$app/navigation';
import {DatePicker, Input, InputGroup, Select, TextArea} from '$lib/components';
import type {ActionData} from './$types';

export let form: ActionData;

let loading = false;
let states = ['draft', 'published'];
let questions: Array<string> = [];

function addQuestion(): void {
  questions = [...questions, ''];
}

function deleteQuestion(index: number): void {
  questions = questions.filter((_, i) => i !== index);
}

const submitCreateRetro = (({data}) => {
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

    <div class="form-control w-full max-w-lg mb-2">
      <span class="label font-medium pb-1 label-text">Questions</span>

      <button
        class="btn-outline btn-sm btn w-full max-w-lg"
        type="button"
        on:click={addQuestion}
        disabled={loading}
      >
        Add Question
      </button>
    </div>

    {#each questions as question, index (index)}
      <InputGroup
        id={question}
        bind:value={question}
        placeholder="Enter question text"
        on:click={() => deleteQuestion(index)}
        disabled={loading}
      />
    {/each}

    <div class="w-full max-w-lg pt-3">
      <button type="submit" class="btn btn-primary w-full max-w-lg" disabled={loading}
        >Create Retro</button
      >
    </div>
  </form>
</div>
