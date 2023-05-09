import {OAUTH_REDIRECT_URL} from '$lib/constants';
import type {OAuthLink} from '$lib/types/oauth';
import {Collections} from '$lib/types/pocketbase-types';
import {error, redirect} from '@sveltejs/kit';
import type {Actions, PageServerLoad, RequestEvent} from './$types';
import type {ClientResponseError} from 'pocketbase';

export const load = (event => {
  const {locals} = event;

  // Redirect to start page if already authenticated.
  if (locals.pb.authStore.isValid) {
    throw redirect(303, '/');
  }

  return {
    oauthLinks: buildOauthLinks(event),
  };
}) satisfies PageServerLoad;

async function buildOauthLinks({locals, url}: RequestEvent): Promise<Array<OAuthLink>> {
  const redirectURL = `${url.origin}${OAUTH_REDIRECT_URL}`;
  const oauthLinks: Array<OAuthLink> = [];

  const authMethods = await locals.pb.collection(Collections.Users).listAuthMethods();

  for (const provider of authMethods.authProviders) {
    const oauthLink: OAuthLink = {
      name: provider.name,
      href: provider.authUrl + redirectURL,
      state: provider.state,
    };

    oauthLinks.push(oauthLink);
  }

  return oauthLinks;
}

interface Login {
  email?: string;
  password?: string;
}

export const actions: Actions = {
  login: async ({locals, request}) => {
    const formData: Login = Object.fromEntries(await request.formData());

    if (!formData.email || !formData.password) {
      throw error(404);
    }

    try {
      await locals.pb.collection('users').authWithPassword(formData.email, formData.password);
    } catch (err) {
      const e = err as ClientResponseError;
      console.log('Error:', e);
      throw error(e.status, e.message);
    }

    throw redirect(303, '/');
  },
};
