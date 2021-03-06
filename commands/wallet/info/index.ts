import * as Yup from 'yup';
import { User } from 'models';
import GuildSchema from 'models/guild';
import ChannelSchema from 'models/channel';

import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { getPrefix, usageGenerate } from 'utils/messages';
import getDMChannelByUserId from 'utils/getDMChannelByUserId';
import getMemberInfo from 'utils/axios/getMemberInfo';
import { getAccessToken } from 'utils/axios';

const info: CommandHandler = async message => {
  const user = await User.findOne({ uuid: message.author.id });
  if (!user) {
    return failedEmbedGenerator({
      description:
        'You have not connected a Web Wallet. Create or update the wallet address for this Discord user.'
    });
  } else {
    // Prepare user to prompt
    let discordUser = await getDMChannelByUserId(message.author.id);
    if (!discordUser.dmChannel) {
      // Try to send an Initial to establish an DM Channel with user
      // In many cases, discord choose to "forgot" an channel and
      // This help to establish it again
      await message.author.send('Retrieving your wallet information...');
      discordUser = await getDMChannelByUserId(message.author.id);
    }
    if (!discordUser.dmChannel) {
      return failedEmbedGenerator({
        description:
          "If you don't receive a DM from THX Bot, please check the message settings for your guild."
      });
    }

    const guild = await GuildSchema.findOne({
      id: message.guild?.id
    });

    if (!guild?.client_id || !guild?.client_secret) {
      return failedEmbedGenerator({
        description: `Please setup Client ID and Client Secret for your Guild first with the \`${getPrefix()}setup guild\` command.`
      });
    }
    // Use axios to
    const accessToken = await getAccessToken(
      guild.client_id,
      guild.client_secret
    );

    if (!accessToken) {
      return failedEmbedGenerator({
        description:
          'Invalid Client ID or Client Secret, please configure update your guild settings.'
      });
    }

    // is setted up
    const channel = await ChannelSchema.findOne({
      id: message.channel.id
    });

    if (!channel?.pool_address) {
      return failedEmbedGenerator({
        description: `Please setup an Asset Pool contract address for your Guild first with the \`${getPrefix()}setup assetpool\` command.`
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

    discordUser.send(
      successEmbedGenerator({
        title: 'Web Wallet ' + info.address + ':',
        description: 'Balance: ' + info.token.balance + ' ' + info.token.symbol
      })
    );
    return;
  }
};

export default listenerGenerator({
  name: 'info',
  cooldown: 10,
  queued: false,
  handler: info,
  type: ListenerType.GENERAL,
  validationSchema: Yup.array().min(0).max(0),
  helpMessage: 'View the balance for your Web Wallet',
  usageMessage: usageGenerate({
    name: 'info',
    desc: 'Wallet membership information.',
    path: 'wallet info',
    params: [],
    example: `wallet info`
  })
});
