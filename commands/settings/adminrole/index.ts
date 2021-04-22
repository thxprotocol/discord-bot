import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';

export default listenerGenerator({
  name: 'adminrole',
  cooldown: 10,
  queued: false,
  type: ListenerType.GENERAL,
  helpMessage:
    'A group of command that interact with guild admin roles settings',
  usageMessage:
    'A group of command that interact with guild admin roles settings'
});
