<script lang="ts">
export let value: string | undefined = '';
export let placeholder = '';
export let id = '';
export let label = '';
export let type = 'text';
export let disabled = false;
export let required = false;

function handleInput(event: Event): void {
  if (event instanceof InputEvent && event.target instanceof HTMLInputElement) {
    value = event.target.value;
  }
}
</script>

<div class="w-full max-w-lg mb-2">
  <label for={id} class="label">
    <span>{label}</span>

    <input
      {disabled}
      {id}
      {placeholder}
      {required}
      {type}
      {value}
      class="input variant-form-material"
      name={id}
      on:input={handleInput}
    />
  </label>
</div>
