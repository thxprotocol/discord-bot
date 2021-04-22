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

    return config;
  });

  return client;
};

export default createClient;
