import { getClientWithAccess } from './getClient';

const getAuthenticationToken = async (
  contractAddress: string,
  accessToken: string,
  email: string,
  password: string
): Promise<boolean> => {
  const axios = getClientWithAccess(accessToken);
  try {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);

    const r = await axios({
      method: 'POST',
      url: `https://api.thx.network/v1/authentication_token`,
      headers: {
        AssetPool: contractAddress
      },
      data: params
    });

    if (r.status !== 200) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export default getAuthenticationToken;
