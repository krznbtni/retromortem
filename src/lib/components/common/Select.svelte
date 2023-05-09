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

<div class="w-full max-w-lg mb-2">
  <label for={id} class="label">
    <span>{label}</span>
  </label>

  <select class="select variant-form-material" {required} {disabled} {value} {id} name={id}>
    {#each options as option (option)}
      <option value={option}>{option}</option>
    {/each}
  </select>
</div>
