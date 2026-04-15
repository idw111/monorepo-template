import { createHmac } from 'crypto';

import axios from 'axios';

import envvars from '@/configs/envvars';

const generateSignature = (method: string, url: string, timestamp: string): string => {
  const hmac = createHmac('sha256', envvars.ncloudAccessSecret);
  hmac.update(`${method} ${url}\n${timestamp}\n${envvars.ncloudAccessKey}`);
  return hmac.digest('base64');
};

const getMessageWithParams = (
  message: string,
  params: { [key: string]: unknown } | undefined,
  options: { opening: string; closing: string } = { opening: '#{', closing: '}' }
): string => {
  if (!params) return message;
  return Object.keys(params).reduce((messageWithParams, key) => {
    let pos = null;
    let _message = messageWithParams;
    const pattern = `${options.opening}${key}${options.closing}`;
    const text = params[key];
    while ((pos = _message.indexOf(pattern)) !== -1) {
      _message = _message.substr(0, pos) + text + _message.substr(pos + pattern.length);
    }
    return _message;
  }, message);
};

export const sendAlimtalk = async (phone: string, templateCode: string, templateMessage: string): Promise<Record<string, unknown>> => {
  const serviceId = envvars.ncloudServiceId;
  const url = `https://sens.apigw.ntruss.com/alimtalk/v2/services/${serviceId}/messages`;
  const timestamp = Date.now().toString();
  const headers = {
    'Content-Type': 'application/json',
    'x-ncp-apigw-timestamp': timestamp,
    'x-ncp-iam-access-key': envvars.ncloudAccessKey,
    'x-ncp-apigw-signature-v2': generateSignature('POST', `/alimtalk/v2/services/${serviceId}/messages`, timestamp),
  };
  const { data } = await axios.post(
    url,
    {
      templateCode,
      plusFriendId: envvars.kakaoChannel,
      messages: [
        {
          to: phone,
          content: getMessageWithParams(templateMessage, {}),
          buttons: [
            {
              type: 'WL',
              name: 'button name',
              linkMobile: `https://...`,
              linkPc: `https://...`,
            },
          ],
        },
      ],
    },
    { headers }
  );
  return data;
};
