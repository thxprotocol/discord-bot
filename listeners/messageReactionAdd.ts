import { MessageReaction } from 'discord.js';
import { useSelector } from '@hooks';
import Guild from 'models/guild';
import User from 'models/user';
import { getReactionString } from 'commands/emoji/add/utils';
import {
  discordEmojiRegex,
  emojiRegex
} from 'commands/wallet/update/constants';
import { selectChannelByID } from 'core/store/selectors';
import { checkChannelIsPool } from 'models/channel/utils';
import { getAccessToken, getClientWithAccess } from 'utils/axios';
import { getLogger } from 'utils/logger';

const onReactionAdd = async (reaction: MessageReaction) => {
  if (reaction.message.guild) {
    const isLinked = await checkChannelIsPool(reaction.message.channel.id);
    if (isLinked) {
      const cachedChannel = useSelector(
        selectChannelByID(reaction.message.channel.id)
      );
      const content = reaction.emoji.toString();
      const isNormalEmoji = emojiRegex.exec(content);
      const isDiscordEmoji = discordEmojiRegex.exec(content);
      const reactionString = getReactionString(isNormalEmoji, isDiscordEmoji);
      const reward = cachedChannel.reactions[reactionString];
      if (reward === undefined) return;
      const guild = await Guild.findOne({
        id: reaction.message.guild?.id
      });
      if (!guild) return;
      // Conditional syntax just to fix TS
      // Errors. since much have 2 of this
      // before can goes here
      await reaction.message.fetch();
      // Fetch info again incase this message
      // not yet cached by the bot
      const postOwner = await User.findOne({
        uuid: reaction.message.author.id
      });
      if (!postOwner || !postOwner.public_address) return;
      const accessToken = await getAccessToken(
        guild.client_id,
        guild.client_secret
      );
      const axios = getClientWithAccess(accessToken || '');
      const params = new URLSearchParams();
      params.append('member', postOwner.public_address);
      try {
        await axios({
          method: 'POST',
          url: `https://api.thx.network/v1/rewards/${reward}/give`,
          headers: {
            AssetPool: cachedChannel.poolAddress
          },
          data: params
        });
      } catch {
        const logger = getLogger();
        logger.error(
          `Cannot give reward to user with UUID: ${reaction.message.author.id}`
        );
      }
    }
  }
};

export default onReactionAdd;
