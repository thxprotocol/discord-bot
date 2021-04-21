import axios, { AxiosInstance } from 'axios';

const createClient = () => {
  let client: AxiosInstance | null = null;

  return () => {
    if (client) return client;
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    if (!CLIENT_ID) throw new Error('Cannot find Client ID in enviroment');
    if (!CLIENT_SECRET)
      throw new Error('Cannot find Client Secrect in enviroment');

    const authorizationToken = Buffer.from(
      `${CLIENT_ID}:${CLIENT_SECRET}`
    ).toString('base64');

    const authorizationPayload = 'Basic ' + authorizationToken;

    client = axios.create({
      //60 sec timeout
      timeout: 60000
    });

    client.interceptors.request.use(function (config) {
      config.headers.Authorization = authorizationPayload;

      return config;
    });

    return client;
  };
};

export default createClient();
