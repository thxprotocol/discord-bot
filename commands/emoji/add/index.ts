import _ from 'lodash';
import { URLSearchParams } from 'url';
import { DMChannel, TextChannel } from 'discord.js';
import GuildChema from 'models/guild';
import ChannelSchema from 'models/channel';
import ReactionSchema from 'models/reaction';
import promter from 'discordjs-prompter';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { CommandHandler } from 'types';
import { getPrefix } from 'utils/messages';
import {
  discordEmojiRegex,
  emojiRegex
} from 'commands/wallet/update/constants';
import { getClientWithAccess } from 'utils/axios/getClient';
import { getAccessToken } from 'utils/axios';
import { RewardResponse } from './types';
import { getReactionString } from './utils';

const setup: CommandHandler = async message => {
  // is setted up
  const channel = await ChannelSchema.findOne({
    id: message.channel.id
  });

  if (!channel?.pool_address) {
    return failedEmbedGenerator({
      description: `To do this, please setup Contract Address for your Channel first by: \`${getPrefix()}setup assetpool\` command`
    });
  }

  const reactionRes = await promter.message(
    message.channel as TextChannel | DMChannel,
    {
      max: 1,
      question: 'What emoji you want to use?',
      userId: message.author.id,
      timeout: 10000
    }
  );

  if (!reactionRes) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  } else if (!reactionRes.size) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  }

  const content = reactionRes.first()?.cleanContent || '';

  const isNormalEmoji = emojiRegex.exec(content);
  const isDiscordEmoji = discordEmojiRegex.exec(content);

  if (!isDiscordEmoji && !isNormalEmoji) {
    return failedEmbedGenerator({
      description: 'This not a valid emoji'
    });
  }

  const guild = await GuildChema.findOne({
    id: message.guild?.id
  });

  if (!guild?.client_id || !guild?.client_secret) {
    return failedEmbedGenerator({
      description: `To do this, please setup Client ID and Client Token for your Guild first by: \`${getPrefix()}setup guild\` command`
    });
  }

  const accessToken = await getAccessToken(
    guild.client_id,
    guild.client_secret
  );

  if (!accessToken) {
    return failedEmbedGenerator({
      description: 'Invalid Client ID or Client Token, please setup again'
    });
  }
  // Collect further Inforamtion after
  // Make sure other things is correct

  const withdrawAmountRes = await promter.message(
    message.channel as TextChannel | DMChannel,
    {
      max: 1,
      question: 'Please spectify your reward value?',
      userId: message.author.id,
      timeout: 10000
    }
  );

  if (!withdrawAmountRes) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  } else if (!withdrawAmountRes.size) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  }

  const withdrawAmount = _.toNumber(
    withdrawAmountRes.first()?.cleanContent || ''
  );

  if (!withdrawAmount) {
    return failedEmbedGenerator({
      description: 'This not a valid number'
    });
  }

  const withdrawDurationRes = await promter.message(
    message.channel as TextChannel | DMChannel,
    {
      max: 1,
      question: 'Please spectify your reward duration?',
      userId: message.author.id,
      timeout: 10000
    }
  );

  if (!withdrawDurationRes) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  } else if (!withdrawDurationRes.size) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  }

  const withdrawDuration = _.toNumber(
    withdrawAmountRes.first()?.cleanContent || ''
  );

  if (!withdrawDuration) {
    return failedEmbedGenerator({
      description: 'This not a valid number'
    });
  }

  // Creating Reward
  const reactionString = getReactionString(isNormalEmoji, isDiscordEmoji);
  const axios = getClientWithAccess(accessToken);
  const params = new URLSearchParams();
  params.append('withdrawAmount', `${withdrawAmount}`);
  params.append('withdrawDuration', `${withdrawDuration}`);

  const rewardResponse: RewardResponse = await axios({
    url: 'https://api.thx.network/v1/rewards',
    method: 'POST',
    headers: {
      AssetPool: channel.pool_address
    },
    data: params
  });

  // Activate Reward
  await axios({
    method: 'POST',
    url: `https://api.thx.network/v1/rewards/${rewardResponse.data.id}/poll/finalize`,
    headers: {
      AssetPool: channel.pool_address
    }
  });

  await ReactionSchema.findOneAndUpdate(
    { reaction_id: reactionString, channel },
    {
      reaction_id: reactionString,
      reward_id: rewardResponse.data.id || '',
      channel: channel
    },
    { upsert: true }
  );

  // Cleaning up
  return successEmbedGenerator({
    description: 'Successfully link a reward to this reaction'
  });
};
export default listenerGenerator({
  name: 'add',
  queued: true,
  handler: setup,
  type: ListenerType.GUILD_ADMINS,
  helpMessage: 'Add a reward with a emoji',
  usageMessage: 'Add a reward with a emoji'
});
