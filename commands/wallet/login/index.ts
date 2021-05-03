import * as Yup from 'yup';
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
import getAuthenticationToken from 'utils/axios/getAuthenticationToken';
import { decryptString } from 'utils/decrypt';

const login: CommandHandler = async (message, params) => {
  await message.delete();

  // Check is a valid email
  const isValidEmail = emailRegex.test(params[0]);

  if (!isValidEmail) {
    return failedEmbedGenerator({
      description: 'This e-mail address is invalid'
    });
  }

  const guild = await GuildSchema.findOne({
    id: message.guild?.id
  });

  if (!guild?.client_id || !guild?.client_secret) {
    return failedEmbedGenerator({
      description: `To do this, please setup Client ID and Client Token for your Guild first by: \`${getPrefix()}setup guild\` command`
    });
  }

  const user = await User.findOne({ uuid: message.author.id });
  if (!user) {
    return failedEmbedGenerator({
      description: 'Please create a wallet address first.'
    });
  } else {
    // Use axios to
    const accessToken = await getAccessToken(
      guild.client_id,
      guild.client_secret
    );

    if (!accessToken) {
      return failedEmbedGenerator({
        description: 'Invalid Client ID or Client Token, please setup again'
      });
    }

    // is setted up
    const channel = await ChannelSchema.findOne({
      id: message.channel.id
    });

    if (!channel?.pool_address) {
      return failedEmbedGenerator({
        description: `To do this, please setup Contract Address for your Channel first by: \`${getPrefix()}setup assetpool\` command`
      });
    }

    const res = await getAuthenticationToken(
      channel.pool_address,
      accessToken,
      params[0],
      decryptString(user.password, process.env.SECRET)
    );

    if (!res) {
      return failedEmbedGenerator({
        description: `Failed sending your one-time login link.`
      });
    }

    return successEmbedGenerator({
      title: 'Your one-time login has been sent!',
      description:
        'Valid for 10 minutes. Go to your e-mail and get access to your rewards.'
    });
  }
};

export default listenerGenerator({
  name: 'login',
  cooldown: 10,
  queued: false,
  handler: login,
  type: ListenerType.GENERAL,
  validationSchema: Yup.array().min(1).max(1),
  helpMessage: 'Login user wallet',
  usageMessage: usageGenerate({
    name: 'login',
    desc: 'Login user wallet',
    path: 'wallet login',
    params: ['email'],
    example: `wallet login john@doe.com`
  })
});
