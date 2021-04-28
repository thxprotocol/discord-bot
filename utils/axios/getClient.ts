import axios, { AxiosInstance } from 'axios';
import { getLogger } from 'utils/logger';

const createClient = (clientId: string, clientToken: string): AxiosInstance => {
  const authorizationString = `${clientId}:${clientToken}`;
  const authorizationToken = Buffer.from(authorizationString).toString(
    'base64'
  );
  const authorizationPayload = 'Basic ' + authorizationToken;

  const client = axios.create({
    //60 sec timeout
    timeout: 60000
  });

  client.interceptors.request.use(function (config) {
    config.headers.Authorization = authorizationPayload;
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    return config;
  });

  return client;
};

export const getClientWithAccess = (accessToken: string): AxiosInstance => {
  const logger = getLogger();
  const authorizationPayload = 'Bearer ' + accessToken;
  const client = axios.create({
    //60 sec timeout
    timeout: 60000
  });

  client.interceptors.request.use(function (config) {
    config.headers.Authorization = authorizationPayload;
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    return config;
  });

  client.interceptors.response.use(response => {
    const isSuccess = response.status >= 200 && response.status <= 200;
    if (isSuccess) {
      logger.info(
        `[${response.status}] ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`
      );
    } else {
      logger.error(
        `[${response.status}] ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`
      );
    }
    return response;
  });

  return client;
};

export default createClient;
