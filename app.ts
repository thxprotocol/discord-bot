import dotenv from 'dotenv';
import getClient from 'core/client';
import onReady from 'listeners/ready';
import 'module-alias/register';

const application = async () => {
  dotenv.config();

  // Init Discord Client
  const client = getClient();

  client.on('ready', onReady);

  // Login with Environment Token
  await client.login(process.env.TOKEN);
  return client;
};

export default application;
