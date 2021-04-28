import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';

export default listenerGenerator({
  name: 'settings',
  queued: false,
  type: ListenerType.GENERAL,
  helpMessage: 'A group of command that interact with guild settings',
  usageMessage: 'A group of command that interact with guild settings'
});
