import { describe, test, expect, mock } from 'bun:test';
import { getTempCredential } from '../lib/credential';

const getCredentialMock = mock(() =>
  Promise.resolve({
    credentials: {
      tmpSecretId: 'mock-tmp-secret-id',
      tmpSecretKey: 'mock-tmp-secret-key',
      sessionToken: 'mock-session-token',
    },
    startTime: 1234567890,
    expiredTime: 1234567890 + 7200,
  }),
);

mock.module('qcloud-cos-sts', () => ({
  getCredential: getCredentialMock,
}));

describe('getTempCredential function', () => {
  test('should return a temporary credential', async () => {
    const result = await getTempCredential('test-file-key');

    expect(getCredentialMock).toHaveBeenCalled();

    expect(getCredentialMock).toHaveBeenCalledWith({
      secretId: process.env.TENCENT_COS_SECRET_ID || '',
      secretKey: process.env.TENCENT_COS_SECRET_KEY || '',
      policy: expect.objectContaining({
        version: '2.0',
        statement: expect.arrayContaining([
          expect.objectContaining({
            action: ['name/cos:PutObject'],
            effect: 'allow',
          }),
        ]),
      }),
    });

    expect(result).toEqual({
      tmpSecretId: 'mock-tmp-secret-id',
      tmpSecretKey: 'mock-tmp-secret-key',
      sessionToken: 'mock-session-token',
      startTime: 1234567890,
      expiredTime: 1234567890 + 7200,
    });
  });
});
