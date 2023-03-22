import { redirect } from '@sveltejs/kit';
import type {  PageServerLoad } from './$types';
// import type { ClientResponseError } from 'pocketbase';

export const load = (async ({ locals, url }) => {
	if (locals.pb.authStore.isValid) {
		throw redirect(303, '/');
	}

  const authMethods = await locals.pb.collection('users').listAuthMethods();

  if (!authMethods) {
    return {
      authProviderRedirect: '',
      authProviderState: ''
    }
  }

  const redirectURL = `${url.origin}/api/oauth2`;
  const githubAuthProvider = authMethods.authProviders[0];
  const authProviderRedirect = `${githubAuthProvider.authUrl}${redirectURL}`
  const authProviderState = githubAuthProvider.state;

  return {
    authProviderRedirect,
    authProviderState
  }
}) satisfies PageServerLoad;
