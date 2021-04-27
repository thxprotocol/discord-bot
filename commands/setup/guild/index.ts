import Reaction from 'models/reaction';
import Channel from 'models/channel';
import Guild from 'models/guild';
import { DMChannel, TextChannel } from 'discord.js';
import promter from 'discordjs-prompter';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { CommandHandler } from 'types';
import { getAccessToken } from 'utils/axios';

const setup: CommandHandler = async message => {
  const clientIdRes = await promter.message(
    message.channel as TextChannel | DMChannel,
    {
      question: 'What is your client ID?',
      userId: message.author.id,
      max: 1,
      timeout: 10000
    }
  );

  if (!clientIdRes) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  } else if (!clientIdRes.size) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  }

  await clientIdRes.first()?.delete();
  const clientTokenRes = await promter.message(
    message.channel as TextChannel | DMChannel,
    {
      question: 'What is your Client Token?',
      userId: message.author.id,
      max: 1,
      timeout: 10000
    }
  );

  if (!clientTokenRes) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  } else if (!clientTokenRes.size) {
    return failedEmbedGenerator({
      description: 'Please start again this process'
    });
  }

  await clientTokenRes.first()?.delete();

  // Map variables
  const clientId = clientIdRes.first()?.cleanContent || '';
  const clientToken = clientTokenRes.first()?.cleanContent || '';

  // Try to get access token from user inputs
  try {
    await getAccessToken(clientId, clientToken);
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
  usageMessage: 'Setting up basic settings for Guild'
});
