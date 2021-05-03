import { MessageReaction, PartialUser, User as DiscordUser } from 'discord.js';
import Channel from 'models/channel';
import Reaction from 'models/reaction';
import ReactionCache from 'models/reactionCache';
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
import getDMChannelByUserId from 'utils/getDMChannelByUserId';
import getWalletLink from 'utils/getWalletLink';
import { successEmbedGenerator } from 'utils/embed';

const onReactionAdd = async (
  reaction: MessageReaction,
  user: DiscordUser | PartialUser
) => {
  if (reaction.message.guild) {
    const logger = getLogger();
    await reaction.message.fetch();
    const isLinked = await checkChannelIsPool(reaction.message.channel.id);
    const isOwner = user.id === reaction.message.author.id;
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
      // Return if the reaction author is
      // reaction the message.
      const cachedReaction = await ReactionCache.findOne({
        uuid: user.id,
        reactionId: reactionString,
        messageId: reaction.message.id
      });
      if (cachedReaction) return;

      const accessToken = await getAccessToken(
        guild.client_id,
        guild.client_secret
      );
      const axios = getClientWithAccess(accessToken || '');
      const params = new URLSearchParams();
      params.append('member', author.public_address);

      try {
        const r = await axios({
          method: 'POST',
          url: `https://api.thx.network/v1/rewards/${reward.reward_id}/give`,
          headers: {
            AssetPool: channel.pool_address
          },
          data: params
        });

        try {
          await axios({
            method: 'POST',
            url: `https://api.thx.network/v1/withdrawals/${r.data.withdrawal}/withdraw`,
            headers: {
              AssetPool: channel.pool_address
            }
          });
        } catch (e) {
          logger.error(
            `Failed to finalize the withdrawal with id ${r.data.withdrawal} in ${channel.pool_address} to ${author.public_address}`
          );
        }

        const contractLink = getWalletLink(channel.pool_address);

        // Notify post owner
        const authorChannel = await getDMChannelByUserId(
          reaction.message.author.id
        );

        await ReactionCache.create({
          uuid: user.id,
          reactionId: reactionString,
          messageId: reaction.message.id
        });

        const successMessage = successEmbedGenerator({
          title: 'You got a new reward!',
          description: 'Now you can claim it by click the link above',
          url: contractLink
        });

        authorChannel.send(successMessage);

        // Log infomations

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
