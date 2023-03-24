import {OAUTH_REDIRECT_URL} from '$lib/constants';
import type {OAuthLink} from '$lib/types/oauth';
import {redirect} from '@sveltejs/kit';
import type {PageServerLoad, RequestEvent} from './$types';

export const load = (event => {
  const {locals} = event;

  // Redirect to startpage if already authenticated.
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

  const authMethods = await locals.pb.collection('users').listAuthMethods();

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
