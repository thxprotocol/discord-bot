import ChannelModel from 'models/channel';

export const checkChannelIsPool = async (channelId: string) => {
  const channel = await ChannelModel.findOne({ id: channelId });
  if (!channel) return false;
  return !!channel.pool_address;
};
