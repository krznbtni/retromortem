<script lang="ts">
export let value: unknown;
export let label = '';
export let disabled = false;
export let required = false;
export let options: Array<unknown> = [];
export let id = '';

$: {
  value = options[0];
}
</script>

<div class="form-control w-full max-w-lg mb-2">
  <label class="label" for={id}>
    <span class="label-text">{label}</span>
  </label>

  <select class="select select-bordered" {required} {disabled} {value} {id} name={id}>
    {#each options as option (option)}
      <option value={option}>{option}</option>
    {/each}
  </select>
</div>
