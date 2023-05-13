<script lang="ts">
export let value: unknown;
export let label = '';
export let disabled = false;
export let required = false;
export let options: Array<unknown> = [];
export let id = '';
export let multiple = false;

function handleChange(event: Event): void {
  if (event instanceof Event && event.target instanceof HTMLSelectElement) {
    if (!multiple) {
      value = event.target.value;
    } else {
      value = Array.from(event.target.selectedOptions).map(x => x.value);
    }
  }
}
</script>

<div class="w-full max-w-lg mb-2">
  <label for={id} class="label">
    <span>{label}</span>
  </label>

  <select
    {disabled}
    {id}
    {required}
    {value}
    {multiple}
    class="select variant-form-material"
    name={id}
    on:change={handleChange}
  >
    {#each options as option (option)}
      <option value={option}>{option}</option>
    {/each}
  </select>
</div>
