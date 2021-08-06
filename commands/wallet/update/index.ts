import promter from 'discordjs-prompter';
import { User } from 'models';
import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { walletRegex } from './constants';
import { getPrefix, usageGenerate } from 'utils/messages';
import getDMChannelByUserId from 'utils/getDMChannelByUserId';
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

const update: CommandHandler = async message => {
  // Prepare user to prompt
  let discordUser = await getDMChannelByUserId(message.author.id);
  if (!discordUser.dmChannel) {
    // Try to send an Initial to establish an DM Channel with user
    // In many cases, discord choose to "forgot" an channel and
    // This help to establish it again
    await message.author.send(
      'We need few information before can update your wallet'
    );
    discordUser = await getDMChannelByUserId(message.author.id);
  }
  if (!discordUser.dmChannel) {
    return failedEmbedGenerator({
      description:
        "Please start this process again. If you don't receive a DM from THX Bot, please check the message settings for your guild."
    });
  }

  // Prompt User to Input Wallet
  const walletRes = await promter.message(discordUser.dmChannel, {
    question: 'Input your new address',
    userId: message.author.id,
    max: 1,
    timeout: 30000
  });

  if (!walletRes) {
    discordUser.send(
      failedEmbedGenerator({
        description: 'Please start this process again later.'
      })
    );
    return;
  } else if (!walletRes.size) {
    discordUser.send(
      failedEmbedGenerator({
        description: 'Please start this process again later.'
      })
    );
    return;
  }

  // Check is a valid wallet
  const wallet = walletRes.first()?.cleanContent || '';
  const isValidWallet = walletRegex.test(wallet);

  if (!isValidWallet) {
    discordUser.send(
      failedEmbedGenerator({
        description: 'This wallet address is invalid'
      })
    );
    return;
  }

  const user = await User.findOne({ uuid: message.author.id });
  if (!user) {
    await User.create({ uuid: message.author.id, public_address: wallet });
  } else {
    await user.updateOne({ public_address: wallet });
  }
  const guild = await GuildSchema.findOne({
    id: message.guild?.id
  });

  if (!guild?.client_id || !guild?.client_secret) {
    discordUser.send(
      failedEmbedGenerator({
        description: `To do this, please setup Client ID and Client Secret for your Guild first with the \`${getPrefix()}setup guild\` command.`
      })
    );
    return;
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
    discordUser.send(
      failedEmbedGenerator({
        description: `To do this, please setup the Asset Pool contract address for your channel first with the \`${getPrefix()}setup assetpool\` command.`
      })
    );
    return;
  }

  await addMember(accessToken, channel, wallet);

  discordUser.send(
    successEmbedGenerator({
      description: 'Successfully linked your wallet'
    })
  );
  return;
};

export default listenerGenerator({
  name: 'update',
  cooldown: 10,
  queued: false,
  handler: update,
  type: ListenerType.GENERAL,
  helpMessage: 'Create or update user wallet',
  usageMessage: usageGenerate({
    name: 'update',
    desc: 'Update user wallet',
    path: 'wallet update',
    example: `wallet update`
  })
});
