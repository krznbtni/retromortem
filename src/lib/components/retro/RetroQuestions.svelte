<script lang="ts">
import InputGroup from '$lib/components/common/InputGroup.svelte';

export let questions: Array<string> = [];
export let loading = false;

function addQuestion(): void {
  questions = [...questions, ''];
}

function deleteQuestion(index: number): void {
  questions = questions.filter((_, i) => i !== index);
}
</script>

<div class="form-control w-full max-w-lg mb-2">
  <span class="label font-medium pb-1 label-text">Questions</span>

  <button
    class="btn-outline btn-sm btn w-full max-w-lg"
    type="button"
    on:click={addQuestion}
    disabled={loading}
  >
    Add Question
  </button>
</div>

{#each questions as question, index (index)}
  <InputGroup
    id={question}
    bind:value={question}
    placeholder="Enter question text"
    on:click={() => deleteQuestion(index)}
    disabled={loading}
  />
{/each}
