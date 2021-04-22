import getClient from 'core/client';

const getDMChannelByUserId = async (userId: string) => {
  const user = await getClient().users.fetch(userId);
  return user;
};

export default getDMChannelByUserId;
