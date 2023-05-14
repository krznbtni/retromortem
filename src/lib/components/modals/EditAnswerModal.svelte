<script lang="ts">
import Input from '$lib/components/common/Input.svelte';
import {modalStore} from '@skeletonlabs/skeleton';
import type {AnswersResponse} from '$lib/types/pocketbase-types';
import type {ModalProps} from '@skeletonlabs/skeleton/dist/utilities/Modal/Modal.svelte';

export let answer: AnswersResponse;
export let loading = false;
export let parent: ModalProps;

// We've created a custom submit function to pass the response and close the modal.
function handleSubmit(): void {
  if ($modalStore[0]?.response) {
    $modalStore[0].response(answer);
  }

  modalStore.close();
}

function handleClose(): void {
  modalStore.close();
}
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl space-y-4">
    <header class="text-2xl font-bold">Edit Answer</header>

    <form class="modal-form border border-surface-500 p-4 space-y-4 rounded-container-token">
      <Input id="answer-{answer.id}" label="Answer" bind:value={answer.text} disabled={loading} />
    </form>

    <footer class="modal-footer {parent.regionFooter}">
      <button class="btn {parent.buttonNeutral}" on:click={handleClose}>Cancel</button>
      <button class="btn {parent.buttonPositive}" on:click={handleSubmit}>Submit</button>
    </footer>
  </div>
{/if}
