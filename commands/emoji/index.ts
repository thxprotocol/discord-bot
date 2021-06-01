import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';

export default listenerGenerator({
  queued: true,
  name: 'emoji',
  type: ListenerType.GUILD_ADMINS,
  helpMessage: 'A group of commands used for configuring reaction emoji.',
  usageMessage: 'A group of commands used for configuring reaction emoji.'
});
