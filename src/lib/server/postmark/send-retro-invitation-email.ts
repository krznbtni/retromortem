import {LinkTrackingOptions, type MessageSendingResponse} from 'postmark/dist/client/models';

import {
  commonPayload,
  getPostmarkClient,
  handlePostmarkError,
  type CommonPayload,
} from './postmark';

interface RetroInvitationPayload extends CommonPayload {
  action_url: string;
  recipientUsername: string;
  senderUsername: string;
}

export async function sendRetroInvitationEmail({
  to,
  retroId,
  recipientUsername,
  senderUsername,
}: {
  to: string;
  retroId: string;
  recipientUsername: string;
  senderUsername: string;
}): Promise<MessageSendingResponse | void> {
  const payload: RetroInvitationPayload = {
    ...commonPayload,
    action_url: `https://retromortem.dev/retro/${retroId}`,
    recipientUsername,
    senderUsername,
  };

  try {
    return await getPostmarkClient().sendEmailWithTemplate({
      TemplateAlias: 'retro-invitation',
      From: 'noreply@retromortem.dev',
      To: to,
      TemplateModel: payload,
      TrackOpens: true,
      TrackLinks: LinkTrackingOptions.HtmlAndText,
    });
  } catch (error) {
    handlePostmarkError('sendRetroInvitation', error);
  }
}
