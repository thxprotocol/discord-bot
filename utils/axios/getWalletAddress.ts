import { getClientWithAccess } from './getClient';

const getWalletAddress = async (
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
    params.append('confirmPassword', password);

    const r = await axios({
      method: 'POST',
      url: `https://api.thx.network/v1/signup`,
      headers: {
        AssetPool: contractAddress
      },
      data: params
    });

    if (r.status !== 201) {
      return false;
    }

    return r.data.address;
  } catch {
    return false;
  }
};

export default getWalletAddress;
