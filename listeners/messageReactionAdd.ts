import { MessageReaction, PartialUser, User as DiscordUser } from 'discord.js';
import Channel from 'models/channel';
import Reaction from 'models/reaction';
import Guild from 'models/guild';
import User from 'models/user';
import { getReactionString } from 'commands/emoji/add/utils';
import {
  discordEmojiRegex,
  emojiRegex
} from 'commands/wallet/update/constants';
import { checkChannelIsPool } from 'models/channel/utils';
import { getAccessToken, getClientWithAccess } from 'utils/axios';
import { getLogger } from 'utils/logger';

const onReactionAdd = async (
  reaction: MessageReaction,
  user: DiscordUser | PartialUser
) => {
  if (reaction.message.guild) {
    const logger = getLogger();
    await reaction.message.fetch();
    const isLinked = await checkChannelIsPool(reaction.message.channel.id);
    const isOwner = false;
    if (isLinked && !isOwner) {
      const channel = await Channel.findOne({
        id: reaction.message.channel.id
      });
      if (!channel) return; // for TS not raise type error
      const reactions = await Reaction.find({ channel });
      const content = reaction.emoji.toString();
      const isNormalEmoji = emojiRegex.exec(content);
      const isDiscordEmoji = discordEmojiRegex.exec(content);
      const reactionString = getReactionString(isNormalEmoji, isDiscordEmoji);
      const reward = reactions.find(
        reaction => reaction.reaction_id === reactionString
      );
      if (reward === undefined) return;
      const guild = await Guild.findOne({
        id: reaction.message.guild?.id
      });
      if (!guild) return;
      // Conditional syntax just to fix TS
      // Errors. since much have 2 of this
      // before can goes here
      // Fetch info again incase this message
      // not yet cached by the bot
      const author = await User.findOne({
        uuid: reaction.message.author.id
      });
      if (!author || !author.public_address) return;
      console.log(author.public_address, reward.reward_id);
      const accessToken = await getAccessToken(
        guild.client_id,
        guild.client_secret
      );
      const axios = getClientWithAccess(accessToken || '');
      const params = new URLSearchParams();
      params.append('member', author.public_address);
      try {
        await axios({
          method: 'POST',
          url: `https://api.thx.network/v1/rewards/${reward.reward_id}/give`,
          headers: {
            AssetPool: channel.pool_address
          },
          data: params
        });
        logger.info(
          `Successfully sended a reward with id ${reward.reward_id} in ${channel.pool_address} to ${author.public_address}`
        );
      } catch (error) {
        logger.error(
          `Failed to send a reward with id ${reward.reward_id} in ${channel.pool_address} to ${author.public_address}`
        );
      }
    }
  }
};

export default onReactionAdd;
