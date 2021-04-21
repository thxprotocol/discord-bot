import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';

export default listenerGenerator({
  name: 'wallet',
  cooldown: 10,
  queued: false,
  type: ListenerType.GENERAL,
  helpMessage: 'A group of command that interact with user wallet',
  usageMessage: 'A group of command that interact with user wallet'
});
