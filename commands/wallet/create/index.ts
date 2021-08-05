import promter from 'discordjs-prompter';
import { User } from 'models';
import GuildSchema from 'models/guild';
import ChannelSchema from 'models/channel';
import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { emailRegex, secret } from './constants';
import { getPrefix, usageGenerate } from 'utils/messages';
import { getAccessToken, getWalletAddress } from 'utils/axios';
import getDMChannelByUserId from 'utils/getDMChannelByUserId';
import { encryptString } from 'utils/encrypt';

const create: CommandHandler = async message => {
  await message.delete();

  // Prepare user to prompt
  let discordUser = await getDMChannelByUserId(message.author.id);
  if (!discordUser.dmChannel) {
    // Try to send an Initial to establish an DM Channel with user
    // In many cases, discord choose to "forgot" an channel and
    // This help to establish it again
    await message.author.send(
      'To create your account, we first need some information!'
    );
    discordUser = await getDMChannelByUserId(message.author.id);
  }
  if (!discordUser.dmChannel) {
    return failedEmbedGenerator({
      description:
        "Please start this process again. If you don't receive a DM from THX Bot, please check the message settings for your guild."
    });
  }

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

  // Check is a valid email
  const isValidEmail = emailRegex.test(email);

  if (!isValidEmail) {
    return failedEmbedGenerator({
      description: 'This e-mail address is invalid'
    });
  }

  // Get User Password

  const passwordRes = await promter.message(discordUser.dmChannel, {
    question: 'What is your password?',
    userId: message.author.id,
    max: 1,
    timeout: 30000
  });

  if (!passwordRes) {
    discordUser.send(
      failedEmbedGenerator({
        description: 'Please start this process again later.'
      })
    );
    return;
  } else if (!passwordRes.size) {
    discordUser.send(
      failedEmbedGenerator({
        description: 'Please start this process again later.'
      })
    );
    return;
  }

  const password = passwordRes.first()?.cleanContent || '';

  // Check is a password
  const isPasswordValid = !password.includes(' ');
  if (!isPasswordValid) {
    discordUser.send(
      failedEmbedGenerator({
        description: 'Password cannot contain spaces'
      })
    );
    return;
  }

  // Process user input data

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

    // is setted up
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

    const address = await getWalletAddress(
      channel.pool_address,
      accessToken,
      email,
      password
    );

    if (!address) {
      discordUser.send(
        failedEmbedGenerator({
          description: `Failed linking your wallet.`
        })
      );
      return;
    }

    await User.create({
      uuid: message.author.id,
      public_address: address,
      password: encryptString(password, secret)
    });

    discordUser.send(
      successEmbedGenerator({
        description: 'Successfully linked your wallet'
      })
    );
    return;
  } else {
    discordUser.send(
      failedEmbedGenerator({
        description:
          'You already have linked a wallet. You can only update that wallet address.'
      })
    );
    return;
  }
};

export default listenerGenerator({
  name: 'create',
  cooldown: 10,
  queued: false,
  handler: create,
  type: ListenerType.GENERAL,
  helpMessage: 'Create user wallet',
  usageMessage: usageGenerate({
    name: 'create',
    desc: 'Create user wallet',
    path: 'wallet create',
    example: `wallet create`
  })
});
