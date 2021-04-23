import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';

export default listenerGenerator({
  name: 'setup',
  queued: true,
  type: ListenerType.GUILD_ADMINS,
  helpMessage: 'This command return a pong when you call it (Developer only)',
  usageMessage: 'This command return a pong when you call it (Developer only)'
});
