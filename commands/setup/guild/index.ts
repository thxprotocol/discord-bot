import Reaction from 'models/reaction';
import Channel from 'models/channel';
import Guild from 'models/guild';
import { DMChannel } from 'discord.js';
import promter from 'discordjs-prompter';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { CommandHandler } from 'types';
import { getAccessToken } from 'utils/axios';
import { usageGenerate } from 'utils/messages';
import { getDMChannelByUserId } from 'utils';

const setup: CommandHandler = async message => {
  let user = await getDMChannelByUserId(message.author.id);
  if (!user.dmChannel) {
    // Try to send an Initial to establish an DM Channel with user
    // In many cases, discord choose to "forgot" an channel and
    // This help to establish it again
    await message.author.send(
      'Let start your setup process by asnwer following questions in here!'
    );
    user = await getDMChannelByUserId(message.author.id);
  }
  if (!user.dmChannel) {
    return failedEmbedGenerator({
      description:
        'Please start again this process (If you not seeing DM from the bot, please check your setting)'
    });
  }

  const clientIdRes = await promter.message(user.dmChannel as DMChannel, {
    question: 'What is your client ID?',
    userId: message.author.id,
    max: 1,
    timeout: 30000
  });

  if (!clientIdRes) {
    return failedEmbedGenerator({
      description:
        'Please start again this process (If you not seeing DM from the bot, please check your setting)'
    });
  } else if (!clientIdRes.size) {
    return failedEmbedGenerator({
      description:
        'Please start again this process (If you not seeing DM from the bot, please check your setting)'
    });
  }

  const clientTokenRes = await promter.message(user.dmChannel as DMChannel, {
    question: 'What is your Client Token?',
    userId: message.author.id,
    max: 1,
    timeout: 30000
  });

  if (!clientTokenRes) {
    return failedEmbedGenerator({
      description:
        'Please start again this process (If you not seeing DM from the bot, please check your setting)'
    });
  } else if (!clientTokenRes.size) {
    return failedEmbedGenerator({
      description:
        'Please start again this process (If you not seeing DM from the bot, please check your setting)'
    });
  }

  // Map variables
  const clientId = clientIdRes.first()?.cleanContent || '';
  const clientToken = clientTokenRes.first()?.cleanContent || '';

  // Try to get access token from user inputs
  try {
    const accessToken = await getAccessToken(clientId, clientToken);
    if (!accessToken) {
      return failedEmbedGenerator({
        description: 'Your Client ID or Client Secrect may not correct'
      });
    }
    const guild = await Guild.findOneAndUpdate(
      { id: message.guild?.id },
      { client_id: clientId, client_secret: clientToken },
      { upsert: true }
    );
    // Reset reactions and channel linked to previous Pool address
    if (!guild) return; // This just for TS not raise type error

    const channels = await Channel.find({ guild });

    channels.forEach(async channel => {
      const reactions = await Reaction.find({ channel });
      reactions.forEach(reaction => {
        reaction.delete();
      });
      channel.delete();
    });

    return successEmbedGenerator({
      description: `Successfully setup Client ID and Token for your server`
    });
  } catch {
    return failedEmbedGenerator({
      description: 'Invalid Client ID and Client Token'
    });
  }
};

export default listenerGenerator({
  name: 'guild',
  cooldown: 10,
  queued: false,
  handler: setup,
  type: ListenerType.GUILD_ADMINS,
  helpMessage: 'Setting up basic settings for Guild',
  usageMessage: usageGenerate({
    name: 'guild',
    desc: 'Setting up basic settings for Guild',
    path: 'setup guild'
  })
});
