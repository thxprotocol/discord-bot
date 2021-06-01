import * as Yup from 'yup';
import { User } from 'models';
import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { walletRegex } from './constants';
import { getPrefix, usageGenerate } from 'utils/messages';
import { getAccessToken, getClientWithAccess } from 'utils/axios';
import GuildSchema from 'models/guild';
import ChannelSchema from 'models/channel';

async function addMember(accessToken: string, channel: any, address: string) {
  try {
    const axios = getClientWithAccess(accessToken);
    const params = new URLSearchParams();
    params.append('address', address);

    const r = await axios({
      method: 'POST',
      url: 'https://api.thx.network/v1/members',
      headers: {
        AssetPool: channel?.pool_address
      },
      data: params
    });
    if (r.status !== 201) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

const update: CommandHandler = async (message, params) => {
  // Check is a valid wallet
  const isValidWallet = walletRegex.test(params[0]);

  if (!isValidWallet) {
    return failedEmbedGenerator({
      description: 'This wallet address is invalid'
    });
  }

  const user = await User.findOne({ uuid: message.author.id });
  if (!user) {
    await User.create({ uuid: message.author.id, public_address: params[0] });
  } else {
    await user.updateOne({ public_address: params[0] });
  }
  const guild = await GuildSchema.findOne({
    id: message.guild?.id
  });

  if (!guild?.client_id || !guild?.client_secret) {
    return failedEmbedGenerator({
      description: `To do this, please setup Client ID and Client Secret for your Guild first with the \`${getPrefix()}setup guild\` command.`
    });
  }

  const accessToken = await getAccessToken(
    guild?.client_id || '',
    guild?.client_secret || ''
  );
  if (!accessToken) return;
  const channel = await ChannelSchema.findOne({
    id: message.channel.id
  });

  if (!channel?.pool_address) {
    return failedEmbedGenerator({
      description: `To do this, please setup the Asset Pool contract address for your channel first with the \`${getPrefix()}setup assetpool\` command.`
    });
  }

  await addMember(accessToken, channel, params[0]);

  return successEmbedGenerator({
    description: 'Successfully linked your wallet'
  });
};

export default listenerGenerator({
  name: 'update',
  cooldown: 10,
  queued: false,
  handler: update,
  type: ListenerType.GENERAL,
  validationSchema: Yup.array().min(1).max(1),
  helpMessage: 'Create or update user wallet',
  usageMessage: usageGenerate({
    name: 'update',
    desc: 'Update user wallet',
    path: 'wallet update',
    params: ['address'],
    example: `wallet update 0x278Ff6d33826D906070eE938CDc9788003749e93`
  })
});
