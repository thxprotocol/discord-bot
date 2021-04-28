import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';

export default listenerGenerator({
  queued: true,
  name: 'emoji',
  type: ListenerType.GUILD_ADMINS,
  helpMessage: 'A group of command that interact with emoji',
  usageMessage: 'A group of command that interact with emoji'
});
