import axios, { AxiosInstance } from 'axios';

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
  const authorizationPayload = 'Bearer ' + accessToken;

  const client = axios.create({
    //60 sec timeout
    timeout: 60000
  });

  client.interceptors.request.use(function (config) {
    config.headers.Authorization = authorizationPayload;
    console.log(JSON.stringify(config));
    return config;
  });

  return client;
};

export default createClient;
