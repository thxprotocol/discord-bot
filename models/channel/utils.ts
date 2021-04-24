import { useDispatch, useSelector } from '@hooks';
import { updateChannel } from 'core/store/actions';
import { selectChannelByID } from 'core/store/selectors';
import { Channel } from 'core/store/types';
import ChannelModel from 'models/channel';
import ReactionModel from 'models/reaction';

export const checkChannelIsPool = async (channelId: string) => {
  const dispatch = useDispatch();
  const cachedChannel = useSelector(selectChannelByID(channelId));
  if (cachedChannel) {
    return !!cachedChannel.poolAddress;
  }

  const channel = await ChannelModel.findOne({ id: channelId });
  if (!channel) return false;
  const reactions = await ReactionModel.find({ channel: channel });

  const reactionObj: Channel['reactions'] = {};
  reactions.forEach(reaction => {
    reactionObj[reaction.reaction_id] = reaction.reward_id;
  });

  const newMembers: Channel['members'] = {};
  channel.members.forEach(member => {
    newMembers[member] = true;
  });

  dispatch(
    updateChannel(channelId, {
      poolAddress: channel.pool_address,
      reactions: reactionObj,
      members: newMembers
    })
  );

  return true;
};
