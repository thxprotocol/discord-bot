import GuildChema from 'models/guild';
import ChannelSchema from 'models/channel';
import { DMChannel, TextChannel } from 'discord.js';
import promter from 'discordjs-prompter';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { CommandHandler } from 'types';
import { checkAssetPool, getAccessToken } from 'utils/axios';
import { getPrefix } from 'utils/messages';
import { walletRegex } from 'commands/wallet/update/constants';

const setup: CommandHandler = async message => {
  // Check if Client ID and Client Secrect
  // is setted up

  const guild = await GuildChema.findOne({
    id: message.guild?.id
  });

  if (!guild?.client_id || !guild?.client_secret) {
    return failedEmbedGenerator({
      description: `To do this, please setup Client ID and Client Token for your Guild first by: \`${getPrefix()}setup\` command`
    });
  }

  const contractAddressRes = await promter.message(
    message.channel as TextChannel | DMChannel,
    {
      question: 'What is your contract address?',
      userId: message.author.id,
      max: 1,
      timeout: 10000
    }
  );

  if (!contractAddressRes) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  } else if (!contractAddressRes.size) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  }
  const contractAddress = contractAddressRes.first()?.cleanContent || '';

  if (!walletRegex.test(contractAddress)) {
    return failedEmbedGenerator({
      description: 'Invalid Contract Address'
    });
  }

  // Try to get access token from user inputs
  try {
    const accessToken = await getAccessToken(
      guild.client_id,
      guild.client_secret
    );
    const isValid = await checkAssetPool(contractAddress, accessToken);
    if (!isValid) {
      failedEmbedGenerator({
        description: 'Invalid Contract Address'
      });
    }

    // Find and create a channel object it not yet have
    await ChannelSchema.findOneAndUpdate(
      { id: message.channel.id },
      { pool_address: contractAddress },
      { upsert: true }
    );

    return successEmbedGenerator({
      description: `Successfully update asset pool for this channel`
    });
  } catch {
    return failedEmbedGenerator({
      description: 'Invalid Contract Address'
    });
  }
};

export default listenerGenerator({
  name: 'setup',
  cooldown: 10,
  queued: true,
  handler: setup,
  type: ListenerType.GUILD_ADMINS,
  helpMessage: 'This command return a pong when you call it (Developer only)',
  usageMessage: 'This command return a pong when you call it (Developer only)'
});
