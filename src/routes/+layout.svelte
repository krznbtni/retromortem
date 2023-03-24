<script lang="ts">
import '../app.css';

import NavBar from '$lib/components/layout/NavBar.svelte';
</script>

<div class="min-h-full">
  <NavBar />

  <main class="mx-auto max-w-7xl sm:px-6 lg:px-8">
    <slot />
  </main>
</div>

<style lang="postcss"></style>
