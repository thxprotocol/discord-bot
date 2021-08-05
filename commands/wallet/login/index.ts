import promter from 'discordjs-prompter';
import { User } from 'models';
import GuildSchema from 'models/guild';
import ChannelSchema from 'models/channel';
import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { emailRegex } from './constants';
import { getPrefix, usageGenerate } from 'utils/messages';
import { getAccessToken } from 'utils/axios';
import getDMChannelByUserId from 'utils/getDMChannelByUserId';
import getAuthenticationToken from 'utils/axios/getAuthenticationToken';
import { decryptString } from 'utils/decrypt';

const login: CommandHandler = async message => {
  await message.delete();

  // Prepare user to prompt
  let discordUser = await getDMChannelByUserId(message.author.id);
  if (!discordUser.dmChannel) {
    // Try to send an Initial to establish an DM Channel with user
    // In many cases, discord choose to "forgot" an channel and
    // This help to establish it again
    await message.author.send("Let's setup your Wallet with a few questions!");
    discordUser = await getDMChannelByUserId(message.author.id);
  }
  if (!discordUser.dmChannel) {
    return failedEmbedGenerator({
      description:
        "Please start this process again. If you don't receive a DM from THX Bot, please check the message settings for your guild."
    });
  }

  // Prompt User to Input Email
  const emailRes = await promter.message(discordUser.dmChannel, {
    question: 'What is your email?',
    userId: message.author.id,
    max: 1,
    timeout: 30000
  });

  if (!emailRes) {
    discordUser.send(
      failedEmbedGenerator({
        description: 'Please start this process again later.'
      })
    );
    return;
  } else if (!emailRes.size) {
    discordUser.send(
      failedEmbedGenerator({
        description: 'Please start this process again later.'
      })
    );
    return;
  }

  const email = emailRes.first()?.cleanContent || '';
  const isValidEmail = emailRegex.test(email);

  if (!isValidEmail) {
    discordUser.send(
      failedEmbedGenerator({
        description: 'This e-mail address is invalid'
      })
    );
    return;
  }

  const guild = await GuildSchema.findOne({
    id: message.guild?.id
  });

  if (!guild?.client_id || !guild?.client_secret) {
    discordUser.send(
      failedEmbedGenerator({
        description: `To do this, please setup Client ID and Client Secret for your Guild first by: \`${getPrefix()}setup guild\` command`
      })
    );
    return;
  }

  const user = await User.findOne({ uuid: message.author.id });
  if (!user) {
    discordUser.send(
      failedEmbedGenerator({
        description: 'Please create a wallet address first.'
      })
    );
    return;
  } else {
    // Use axios to
    const accessToken = await getAccessToken(
      guild.client_id,
      guild.client_secret
    );

    if (!accessToken) {
      discordUser.send(
        failedEmbedGenerator({
          description: 'Invalid Client ID or Client Secret, please setup again'
        })
      );
      return;
    }

    const channel = await ChannelSchema.findOne({
      id: message.channel.id
    });

    if (!channel?.pool_address) {
      discordUser.send(
        failedEmbedGenerator({
          description: `To do this, please setup Contract Address for your Channel first by: \`${getPrefix()}setup assetpool\` command`
        })
      );
      return;
    }

    const res = await getAuthenticationToken(
      channel.pool_address,
      accessToken,
      email,
      decryptString(user.password, process.env.SECRET)
    );

    if (!res) {
      discordUser.send(
        failedEmbedGenerator({
          description: `Failed sending your one-time login link.`
        })
      );
      return;
    }

    discordUser.send(
      successEmbedGenerator({
        title: 'Your one-time login has been sent!',
        description:
          'Valid for 10 minutes. Go to your e-mail and get access to your rewards.'
      })
    );
    return;
  }
};

export default listenerGenerator({
  name: 'login',
  cooldown: 10,
  queued: false,
  handler: login,
  type: ListenerType.GENERAL,
  helpMessage: 'Login user wallet',
  usageMessage: usageGenerate({
    name: 'login',
    desc: 'Login user wallet',
    path: 'wallet login',
    example: `wallet login`
  })
});
