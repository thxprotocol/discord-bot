import * as Yup from 'yup';
import { User } from 'models';
import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { walletRegex } from './constants';

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
    return successEmbedGenerator({
      description: 'Successfully link your wallet'
    });
  } else {
    await user.update({ public_address: params[0] });
    return successEmbedGenerator({
      description: 'Successfully link your wallet'
    });
  }
};

export default listenerGenerator({
  name: 'update',
  cooldown: 10,
  queued: false,
  handler: update,
  type: ListenerType.GENERAL,
  validationSchema: Yup.array().min(1),
  helpMessage: 'Create or Update user wallet',
  usageMessage: 'Create or Update user wallet'
});
