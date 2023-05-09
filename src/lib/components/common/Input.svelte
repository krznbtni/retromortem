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

  <input
    {disabled}
    {id}
    {placeholder}
    {required}
    {type}
    {value}
    class={type === 'file'
      ? 'file-input file-input-bordered w-full max-w-lg'
      : 'input input-bordered w-full-max-w-lg'}
    name={id}
    on:input={handleInput}
  />

  {#if errors}
    {#each errors as error}
      <label for={id} class="label py-0 pt-1">
        <span class="label-text-alt text-error">{error}</span>
      </label>
    {/each}
  {/if}
</div>
