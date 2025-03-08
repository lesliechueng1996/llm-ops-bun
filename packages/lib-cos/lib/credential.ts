import { getCredential } from 'qcloud-cos-sts';

export const getTempCredential = async (fileKey: string) => {
  const bucketName = process.env.TENCENT_COS_BUCKET || '';
  const appId = bucketName.substring(1 + bucketName.lastIndexOf('-'));

  const credential = await getCredential({
    secretId: process.env.TENCENT_COS_SECRET_ID || '',
    secretKey: process.env.TENCENT_COS_SECRET_KEY || '',
    policy: {
      version: '2.0',
      statement: [
        {
          action: ['name/cos:PutObject'],
          effect: 'allow',
          principal: { qcs: ['*'] },
          resource: [
            `qcs::cos:${process.env.TENCENT_COS_REGION}:uid/${appId}:${bucketName}/${fileKey}`,
          ],
        },
      ],
    },
  });

  return {
    tmpSecretId: credential.credentials.tmpSecretId,
    tmpSecretKey: credential.credentials.tmpSecretKey,
    sessionToken: credential.credentials.sessionToken,
    startTime: credential.startTime,
    expiredTime: credential.expiredTime,
  };
};
