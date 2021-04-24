import UserModel from 'models/user';
import GuildModel from 'models/guild';
import ChannelModel from 'models/channel';
import { updateChannelMember, verifyCommand } from '@actions';
import { useDispatch, useSelector } from '@hooks';
import { selectChannelByID } from 'core/store/selectors';
import { Message } from 'discord.js';
import { checkChannelIsPool } from 'models/channel/utils';
import { getAccessToken, getClientWithAccess } from 'utils/axios';
import { checkFromSelf, checkMessage } from '../utils/messages';
import { getLogger } from 'utils/logger';

async function onMessage(message: Message): Promise<void> {
  const dispatch = useDispatch();
  // Return if message from itself
  const isFromSelf = checkFromSelf(message.author.id);
  if (isFromSelf) return;

  // Return if is a bot message
  // Bypass bot check if this is from corde bot
  const isFromCorde = message.author.id === process.env.CORDE_BOT_ID;
  const isFromBot = isFromCorde ? false : message.author.bot;
  if (isFromBot) return;

  // Check if a Guild channel linked with a Asset Pool
  if (message.guild) {
    const guild = await GuildModel.findOne({ id: message.guild.id });
    const isLinked = await checkChannelIsPool(message.channel.id);
    if (isLinked) {
      const cachedChannel = useSelector(selectChannelByID(message.channel.id));
      const currentUser = await UserModel.findOne({ uuid: message.author.id });
      if (!currentUser) return;
      const isNotAMember = cachedChannel.members[currentUser.public_address];

      if (isNotAMember) {
        if (!currentUser || !currentUser?.public_address) return; // What to do with this users?

        const accessToken = await getAccessToken(
          guild?.client_id || '',
          guild?.client_secret || ''
        );
        if (!accessToken) return;
        const axios = getClientWithAccess(accessToken);

        try {
          const params = new URLSearchParams();
          params.append('address', currentUser.public_address);

          await axios({
            method: 'POST',
            url: 'https://api.thx.network/v1/members',
            headers: {
              AssetPool: cachedChannel.poolAddress
            },
            data: params
          });

          const remoteChannel = await ChannelModel.findOne({
            id: message.channel.id
          });

          remoteChannel?.members.push(currentUser.public_address);
          dispatch(
            updateChannelMember(
              message.channel.id,
              message.author.id,
              currentUser.public_address
            )
          );
          remoteChannel?.save();

          message.author.send(
            'Successfully connected your wallet to a Asset Pool'
          );
        } catch (error) {
          const logger = getLogger();
          logger.error(error);
        }
      }
    }
  }

  // Check if this is a command
  const isCommand = checkMessage(message.content);
  if (!isCommand) return;

  // Dispatch command
  dispatch(verifyCommand(message));
}

export default onMessage;
