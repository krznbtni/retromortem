import {OAUTH_REDIRECT_URL} from '$lib/constants';
import {redirect} from '@sveltejs/kit';
import type {RequestHandler} from './$types';

export const GET = (async ({url, locals, cookies}) => {
  const redirectUrl = `${url.origin}${OAUTH_REDIRECT_URL}`;
  const expectedProviderState = cookies.get('state');
  const expectedProviderName = cookies.get('name');

  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');

  if (
    !state ||
    !code ||
    !expectedProviderName ||
    !expectedProviderState ||
    expectedProviderState !== state
  ) {
    throw redirect(303, '/login');
  }

  const authMethods = await locals.pb.collection('users').listAuthMethods();
  const provider = authMethods.authProviders.find(
    authProvider => authProvider.name === expectedProviderName,
  );

  if (!provider) {
    throw redirect(303, '/login');
  }

  try {
    await locals.pb
      .collection('users')
      .authWithOAuth2(provider.name, code, provider.codeVerifier, redirectUrl, {
        emailVisibility: true,
      });
  } catch (error) {
    console.error('/api/oauth -> GET -> error:', error);
  }

  throw redirect(303, '/');
}) satisfies RequestHandler;
