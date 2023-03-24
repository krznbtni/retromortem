<script lang="ts">
import {enhance} from '$app/forms';
import {DatePicker, Input, Select, TextArea} from '$lib/components';
import type {ActionData} from './$types';

export let form: ActionData;

let states = ['draft', 'published'];
</script>

<div class="flex justify-center w-full h-full p-2">
  <form
    action="?/create"
    method="POST"
    class="flex flex-col space-y-2 w-full items-center"
    enctype="multipart/form-data"
    use:enhance
  >
    <h3 class="text-3xl font-bold">Tell Daddy some more</h3>
    <p class="mt-2 text-lg">We'll need some info, babyboy</p>

    <Input id="name" label="Name" value={form?.data?.name} required />
    <TextArea id="description" label="Description" value={form?.data?.description} />
    <Select id="state" label="State" value={form?.data?.state} options={states} required />
    <DatePicker id="date" label="Date" value={form?.data?.date} required />
    <Input id="time" label="Time" value={form?.data?.time} required type="time" />

    <!-- <Input id="url" label="Project URL" value={form?.data?.url} errors={form?.errors?.url} /> -->
    <!-- <Input id="thumbnail" label="Thumbnail" type="file" errors={form?.errors?.thumbnail} /> -->

    <div class="w-full max-w-lg pt-3">
      <button type="submit" class="btn btn-primary w-full max-w-lg">Create Retro</button>
    </div>
  </form>
</div>
