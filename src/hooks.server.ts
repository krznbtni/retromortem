import {PUBLIC_POCKETBASE_URL} from '$env/static/public';
import {serializeNonPOJOs} from '$lib/serialize-non-pojos';
import type {Handle} from '@sveltejs/kit';
import type {User} from '$lib/types/user';

import PocketBase from 'pocketbase';

const {PROD} = import.meta.env;

// Hooks are run on every request.
export const handle = (async ({event, resolve}) => {
  event.locals.pb = new PocketBase(PUBLIC_POCKETBASE_URL);

  // Grab the cookie from the browser if we have one.
  const cookie = event.request.headers.get('cookie') || '';

  // Send the cookie to the authStore.
  event.locals.pb.authStore.loadFromCookie(cookie);

  try {
    // Get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    if (event.locals.pb.authStore.isValid) {
      await event.locals.pb.collection('users').authRefresh();

      // Serialize the user model, and save the value in the locals object.
      // The locals object is unique for each user. This is how you distinguish users.
      event.locals.user = serializeNonPOJOs<User>(event.locals.pb.authStore.model as User);
    }
  } catch (_) {
    // Clear the auth store on failed refresh.
    // Same thing as logging out the user.
    event.locals.pb.authStore.clear();
    event.locals.user = undefined;
  }

  // Anything else that happens in the app, server side, happens inside the resolve.
  const response = await resolve(event);

  response.headers.set(
    'set-cookie',
    event.locals.pb.authStore.exportToCookie({secure: PROD, sameSite: 'Lax'}),
  );

  return response;
}) satisfies Handle;
