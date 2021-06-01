import * as Yup from 'yup';
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
import { encryptString } from 'utils/encrypt';

const create: CommandHandler = async (message, params) => {
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
      description: `To do this, please setup Client ID and Client Secret for your Guild first by: \`${getPrefix()}setup guild\` command`
    });
  }

  const user = await User.findOne({ uuid: message.author.id });
  if (!user) {
    // Use axios to
    const accessToken = await getAccessToken(
      guild.client_id,
      guild.client_secret
    );

    if (!accessToken) {
      return failedEmbedGenerator({
        description: 'Invalid Client ID or Client Secret, please setup again'
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

    const address = await getWalletAddress(
      channel.pool_address,
      accessToken,
      params[0],
      params[1]
    );

    if (!address) {
      return failedEmbedGenerator({
        description: `Failed linking your wallet.`
      });
    }

    await User.create({
      uuid: message.author.id,
      public_address: address,
      password: encryptString(params[1], secret)
    });
    return successEmbedGenerator({
      description: 'Successfully linked your wallet'
    });
  } else {
    return failedEmbedGenerator({
      description:
        'You already have linked a wallet. You can only update that wallet address.'
    });
  }
};

export default listenerGenerator({
  name: 'create',
  cooldown: 10,
  queued: false,
  handler: create,
  type: ListenerType.GENERAL,
  validationSchema: Yup.array().min(2).max(2),
  helpMessage: 'Create user wallet',
  usageMessage: usageGenerate({
    name: 'create',
    desc: 'Create user wallet',
    path: 'wallet create',
    params: ['email', 'password'],
    example: `wallet create john@doe.com $ecret1234`
  })
});
