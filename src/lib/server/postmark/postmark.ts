import {POSTMARK_API_TOKEN} from '$env/static/private';

import Postmark from 'postmark';

let postmarkClient: Postmark.ServerClient | undefined = undefined;

export function getPostmarkClient(): Postmark.ServerClient {
  if (postmarkClient) {
    return postmarkClient;
  }

  postmarkClient = new Postmark.ServerClient(POSTMARK_API_TOKEN);
  return postmarkClient;
}

export interface CommonPayload {
  company_address: string;
  company_name: string;
  product_name: string;
  product_url: string;
}

export const commonPayload: CommonPayload = {
  company_address: 'Darknet Street 69',
  company_name: 'RetroMortem',
  product_name: 'RetroMortem',
  product_url: 'https://retromortem.dev',
};

export function handlePostmarkError(func: string, error: unknown): void {
  if (error instanceof Postmark.Errors.PostmarkError) {
    console.error(`${func} -> error -> name: ${error.name}`);
    console.error(`${func} -> error -> message: ${error.message}`);
    console.error(`${func} -> error -> code: ${error.code}`);
    console.error(`${func} -> error -> statusCode: ${error.statusCode}`);
    console.error(`${func} -> error -> cause: ${error.cause as string}`);
    console.error(`${func} -> error -> stack: ${error.stack ?? ''}`);
    return;
  }

  console.error(`${func} -> error -> unknown type: ${error as string}`);
}
