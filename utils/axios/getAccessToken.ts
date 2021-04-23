import { AxiosResponse } from 'axios';
import { useDispatch, useSelector } from '@hooks';
import { updateAccessToken } from 'core/store/actions';
import { selectAccessToken } from 'core/store/selectors';
import { URLSearchParams } from 'url';
import createClient from './getClient';

const BUFFER_TIME = 100;

export const checkExpired = (toCheckTime: number) =>
  toCheckTime - new Date().getTime() > 0;

/**
 * @param clientId: string
 * @param clientToken: string
 * @returns accessToken: string
 * This function also cache token into redux store
 * required clientToken because I want to avoid
 * cross-server clientId bruteforce attach
 */
const getAccessToken = async (clientId: string, clientToken: string) => {
  const dispatch = useDispatch();
  const previousToken = useSelector(selectAccessToken(clientId, clientToken));
  const isExpired = previousToken && checkExpired(previousToken.expireIn);
  if (!isExpired && previousToken) return previousToken.token;

  try {
    const axios = createClient(clientId, clientToken);
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'openid admin');
    const response: AccessTokenResponse = await axios({
      method: 'POST',
      url: 'https://api.thx.network/token',
      data: params
    });
    const currentTime = new Date().getTime() - BUFFER_TIME;
    const expireTime = currentTime + response.data.expires_in * 1000; // Milisecconds
    dispatch(
      updateAccessToken(
        clientId,
        clientToken,
        expireTime,
        response.data.access_token
      )
    );
    return response.data.access_token;
  } catch {
    return undefined;
  }
};

export default getAccessToken;

interface AccessTokenResponse extends AxiosResponse {
  data: {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
  };
}
