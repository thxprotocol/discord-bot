import User from 'models/user';
import Guild from 'models/guild';
import Channel from 'models/channel';
import { verifyCommand } from '@actions';
import { useDispatch } from '@hooks';
import { Message } from 'discord.js';
import { checkChannelIsPool } from 'models/channel/utils';
import { getAccessToken, getClientWithAccess } from 'utils/axios';
import { checkFromSelf, checkMessage } from '../utils/messages';

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

  // Check if this is a command
  const isCommand = checkMessage(message.content);
  if (!isCommand && message.guild) {
    // Check if a Guild channel linked with a Asset Pool
    const guild = await Guild.findOne({ id: message.guild.id });
    const isLinked = await checkChannelIsPool(message.channel.id);
    if (isLinked) {
      const currentUser = await User.findOne({
        uuid: message.author.id
      });
      if (!currentUser || !currentUser.public_address) return;
      const channel = await Channel.findOne({
        id: message.channel.id
      });
      const isMember = channel?.members.includes(currentUser.public_address);
      if (!isMember) {
        try {
          const accessToken = await getAccessToken(
            guild?.client_id || '',
            guild?.client_secret || ''
          );
          if (!accessToken) return;
          const axios = getClientWithAccess(accessToken);

          const params = new URLSearchParams();
          params.append('address', currentUser.public_address);

          await axios({
            method: 'POST',
            url: 'https://api.thx.network/v1/members',
            headers: {
              AssetPool: channel?.pool_address
            },
            data: params
          });

          channel?.members.push(currentUser.public_address);
          channel?.save();

          message.author.send(
            'Successfully connected your wallet to a Asset Pool'
          );
        } catch (error) {
          const errorMessage = error.response.data.error?.message;
          if (errorMessage === 'Address is member already.') {
            channel?.members.push(currentUser.public_address);
            channel?.save();
          } else {
            throw error;
          }
        }
      }
    }
  } else {
    // Dispatch command
    dispatch(verifyCommand(message));
  }
}

export default onMessage;
