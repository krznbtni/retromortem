<script lang="ts">
export let value: string | undefined = '';
export let placeholder = '';
export let id = '';
export let label = '';
export let disabled = false;
export let required = false;
</script>

<div class="w-full max-w-lg">
  <label for={id} class="label">
    <span>{label}</span>
  </label>

  <textarea
    {disabled}
    {id}
    {placeholder}
    {required}
    {value}
    class="textarea variant-form-material"
    name={id}
    rows="4"
  />
</div>
