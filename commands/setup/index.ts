import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';

export default listenerGenerator({
  name: 'setup',
  queued: true,
  type: ListenerType.GUILD_ADMINS,
  helpMessage:
    'A Group of commands that help guild owner-admins setting up they servers',
  usageMessage:
    'A Group of commands that help guild owner-admins setting up they servers'
});
