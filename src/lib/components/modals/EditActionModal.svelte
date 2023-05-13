<script lang="ts">
import {Input, Select} from '$lib/components';
import {modalStore} from '@skeletonlabs/skeleton';
import {ActionsStateOptions, type ActionsResponse} from '$lib/types/pocketbase-types';
import type {ModalProps} from '@skeletonlabs/skeleton/dist/utilities/Modal/Modal.svelte';

export let action: ActionsResponse;
export let loading = false;
export let parent: ModalProps;
export let assigneeRecord: Record<string, Record<string, boolean>>;

let actionStates = Object.values(ActionsStateOptions);

function handleSubmit(): void {
  if ($modalStore[0]?.response) {
    $modalStore[0].response(action);
  }

  modalStore.close();
}

function handleClose(): void {
  modalStore.close();
}

function handleClickAssigneeChip(username: string): void {
  if (
    typeof assigneeRecord[action.id] !== 'undefined' &&
    typeof assigneeRecord[action.id]?.[username] === 'boolean'
  ) {
    assigneeRecord[action.id][username] = !assigneeRecord[action.id][username];
  }
}
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl space-y-4">
    <header class="text-2xl font-bold">Edit Answer</header>

    <form class="modal-form border border-surface-500 p-4 space-y-4 rounded-container-token">
      <Select
        id="action-state-{action.id}"
        label="State"
        bind:value={action.state}
        options={actionStates}
        disabled={loading}
      />

      <Input
        id="dateTime-{action.id}"
        label="Due"
        bind:value={action.due}
        disabled={loading}
        type="datetime-local"
        on:change={event => (action.due = event.target.value)}
      />

      <div class="w-full max-w-lg mb-2">
        <label class="">
          <p>Assignees</p>

          {#each Object.keys(assigneeRecord[action.id] ?? {}) as username, index (username)}
            <button
              type="button"
              class:ml-3={index !== 0}
              on:click={() => handleClickAssigneeChip(username)}
              on:keypress
            >
              <span
                class="chip {assigneeRecord[action.id]?.[username]
                  ? 'variant-filled'
                  : 'variant-soft'}"
              >
                <span>{username}</span>
              </span>
            </button>
          {/each}
        </label>
      </div>

      <Input id="action-{action.id}" label="Text" bind:value={action.text} disabled={loading} />
    </form>

    <footer class="modal-footer {parent.regionFooter}">
      <button class="btn {parent.buttonNeutral}" on:click={handleClose}>Cancel</button>
      <button class="btn {parent.buttonPositive}" on:click={handleSubmit}>Submit</button>
    </footer>
  </div>
{/if}
