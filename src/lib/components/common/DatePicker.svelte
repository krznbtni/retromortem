<script lang="ts">
export let value: string | undefined = '';
export let id = '';
export let label = '';
export let disabled = false;
export let required = false;
export let errors: string[] | undefined = [];
</script>

<div class="form-control w-full max-w-lg mb-2">
  <label for={id} class="label font-medium pb-1">
    <span class="label-text">{label}</span>
  </label>

  <input {disabled} {id} {required} type="date" {value} name={id} />

  {#if errors}
    {#each errors as error}
      <label for={id} class="label py-0 pt-1">
        <span class="label-text-alt text-error">{error}</span>
      </label>
    {/each}
  {/if}
</div>
