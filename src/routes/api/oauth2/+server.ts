import {redirect} from '@sveltejs/kit';
import type { RequestHandler} from './$types';

export const GET = (async({url, locals, cookies}) => {
  const redirectURL = `${url.origin}/api/oauth2`;
  const expectedState = cookies.get('state');

  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');

  const authMethods = await locals.pb.collection('users').listAuthMethods();
  
  if (!authMethods) {
    throw redirect(303, '/login');
  }

  const provider = authMethods.authProviders[0];

  if (!provider) {
    throw redirect(303, '/login');
  }

  if (expectedState !== state) {
    throw redirect(303, '/login');
  }

  try {
    await locals.pb.collection('users').authWithOAuth2(provider.name, code || '', provider.codeVerifier, redirectURL);
  } catch (error) {
    console.error('/api/oauth2 -> GET -> error:', error);
  }

  throw redirect(303, '/')
}) satisfies RequestHandler;
