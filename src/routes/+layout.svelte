<script lang="ts">
import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
import '@skeletonlabs/skeleton/styles/all.css';
import '../app.postcss';

import {AppBar, AppShell, Drawer, drawerStore} from '@skeletonlabs/skeleton';
import Navbar from '$lib/components/layout/NavBar.svelte';

function drawerOpen(): void {
  drawerStore.open({});
}
</script>

<Drawer position="right" width="w-[280px] md:w-[400px]">
  <h2 class="p-4">Navigation</h2>
  <hr />
  <Navbar />
</Drawer>

<AppShell slotSidebarRight="bg-surface-500/5 w-0 lg:w-64">
  <svelte:fragment slot="header">
    <AppBar slotTrail="place-content-end" gap="">
      <a href="/"><strong class="text-xl uppercase">Retromortem</strong></a>

      <svelte:fragment slot="trail">
        <div class="flex items-center">
          <button class="lg:hidden btn btn-sm" on:click={drawerOpen}>
            <span>
              <svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
                <rect width="100" height="20" />
                <rect y="30" width="100" height="20" />
                <rect y="60" width="100" height="20" />
              </svg>
            </span>
          </button>
        </div>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <svelte:fragment slot="sidebarRight">
    <Navbar />
  </svelte:fragment>

  <slot />

  <svelte:fragment slot="footer">Footer</svelte:fragment>
</AppShell>

<style lang="postcss"></style>
