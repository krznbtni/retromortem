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
  </label>

  <div class="input-group input-group-divider grid-cols-[1fr_auto] variant-form-material">
    <input
      {disabled}
      {id}
      {placeholder}
      {required}
      {type}
      {value}
      class="input"
      name={id}
      on:input={handleInput}
    />

    <button class="variant-filled-secondary" type="button" on:click>
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
</div>
