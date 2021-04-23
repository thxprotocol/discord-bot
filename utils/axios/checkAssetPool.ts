import { getClientWithAccess } from './getClient';

const checkAssetPool = async (
  contractAddress: string,
  accessToken: string
): Promise<boolean> => {
  const axios = getClientWithAccess(accessToken);

  try {
    await axios({
      method: 'GET',
      url: `https://api.thx.network/v1/asset_pools/${contractAddress}`,
      headers: {
        AssetPool: contractAddress
      }
    });
    return true;
  } catch {
    return false;
  }
};

export default checkAssetPool;
