import { useDispatch, useSelector } from '@hooks';
import { updateChannel } from 'core/store/actions';
import { selectChannelByID } from 'core/store/selectors';
import { Channel } from 'core/store/types';
import ChannelModel from 'models/channel';

export const checkChannelIsPool = async (channelId: string) => {
  const dispatch = useDispatch();
  const cachedChannel = useSelector(selectChannelByID(channelId));
  if (cachedChannel) {
    return !!cachedChannel.poolAddress;
  }

  const channel = await ChannelModel.findOne({ id: channelId });
  if (!channel) return false;

  const newMembers: Channel['members'] = {};
  channel.members.forEach(member => {
    newMembers[member] = false;
  });

  dispatch(
    updateChannel(channelId, {
      poolAddress: channel.pool_address,
      members: newMembers
    })
  );

  return true;
};
