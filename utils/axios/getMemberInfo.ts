import { IMember } from 'models';
import { getClientWithAccess } from './getClient';

const getMemberInfo = async (
  contractAddress: string,
  accessToken: string,
  address: string
): Promise<false | IMember> => {
  const axios = getClientWithAccess(accessToken);

  try {
    const r = await axios({
      method: 'GET',
      url: `https://api.thx.network/v1/members/${address}`,
      headers: {
        AssetPool: contractAddress
      }
    });

    if (r.status !== 200) {
      return false;
    }

    return r.data;
  } catch {
    return false;
  }
};

export default getMemberInfo;
