<script lang="ts">
import Icon from '@iconify/svelte';

import {createEventDispatcher} from 'svelte';

import InputGroup from '$lib/components/common/InputGroup.svelte';
import type {QuestionsResponse} from '$lib/types/pocketbase-types';

export let loading = false;
export let currentQuestions: Array<QuestionsResponse> = [];
export let questions: Array<string> = [];

const dispatch = createEventDispatcher<{deletedCurrent: number}>();

function addQuestion(): void {
  questions = [...questions, ''];
}

function deleteQuestion(index: number): void {
  questions = questions.filter((_, i) => i !== index);
}

function deleteCurrentQuestion(index: number): void {
  dispatch('deletedCurrent', index);
}
</script>

<div class="w-full max-w-lg mb-2">
  <span class="label">Questions</span>

  <button
    class="btn-sm btn w-full max-w-lg variant-filled-secondary mt-1"
    type="button"
    on:click={addQuestion}
    disabled={loading}
  >
    Add Question
    <Icon icon="mdi:plus-circle" style="margin-left: 0.5rem;" />
  </button>
</div>

{#each currentQuestions as question, index (question.id)}
  <InputGroup
    id={question.id}
    bind:value={question.title}
    placeholder="Enter question text"
    on:click={() => deleteCurrentQuestion(index)}
    disabled={loading}
  />
{/each}

{#each questions as question, index (index)}
  <InputGroup
    id={question}
    bind:value={question}
    placeholder="Enter question text"
    on:click={() => deleteQuestion(index)}
    disabled={loading}
  />
{/each}
