import * as Yup from 'yup';
import { User } from 'models';
import GuildSchema from 'models/guild';
import ChannelSchema from 'models/channel';

import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { getPrefix, usageGenerate } from 'utils/messages';
import getMemberInfo from 'utils/axios/getMemberInfo';
import { getAccessToken } from 'utils/axios';

const info: CommandHandler = async message => {
  const user = await User.findOne({ uuid: message.author.id });
  if (!user) {
    return failedEmbedGenerator({
      description:
        'You have not linkeded a wallet yet. Create or update your wallet address.'
    });
  } else {
    const guild = await GuildSchema.findOne({
      id: message.guild?.id
    });

    if (!guild?.client_id || !guild?.client_secret) {
      return failedEmbedGenerator({
        description: `To do this, please setup Client ID and Client Token for your Guild first by: \`${getPrefix()}setup guild\` command`
      });
    }
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

    const info = await getMemberInfo(
      channel.pool_address,
      accessToken,
      user.public_address
    );

    if (!info) {
      return failedEmbedGenerator({
        description: `Was not able to get member information.`
      });
    }

    return successEmbedGenerator({
      title: 'Member information:',
      description:
        'Balance: ' +
        info.balance.amount +
        ' ' +
        info.balance.symbol +
        '\n' +
        'Address: ' +
        info.address
    });
  }
};

export default listenerGenerator({
  name: 'info',
  cooldown: 10,
  queued: false,
  handler: info,
  type: ListenerType.GENERAL,
  validationSchema: Yup.array().min(0).max(0),
  helpMessage: 'Info about your membership',
  usageMessage: usageGenerate({
    name: 'info',
    desc: 'Wallet membership information.',
    path: 'wallet info',
    params: [],
    example: `wallet info`
  })
});
