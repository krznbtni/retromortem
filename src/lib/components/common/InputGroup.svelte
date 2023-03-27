<script lang="ts">
export let value: string | undefined = '';
export let placeholder = '';
export let id = '';
export let label = '';
export let type = 'text';
export let disabled = false;
export let required = false;
export let errors: string[] | undefined = [];

function handleInput(event: Event): void {
  if (event instanceof InputEvent && event.target instanceof HTMLInputElement) {
    value = event.target.value;
  }
}
</script>

<div class="form-control w-full max-w-lg mb-2">
  <label for={id} class="label font-medium pb-1">
    <span class="label-text">{label}</span>
  </label>

  <div class="input-group">
    <input
      {disabled}
      {id}
      {placeholder}
      {required}
      {type}
      {value}
      class="input input-bordered w-full max-w-lg"
      name={id}
      on:input={handleInput}
    />

    <button class="btn btn-square" type="button" on:click>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>

  {#if errors}
    {#each errors as error}
      <label for={id} class="label py-0 pt-1">
        <span class="label-text-alt text-error">{error}</span>
      </label>
    {/each}
  {/if}
</div>
