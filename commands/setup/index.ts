import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';

export default listenerGenerator({
  name: 'setup',
  queued: true,
  type: ListenerType.GUILD_ADMINS,
  helpMessage:
    'A group of commands that help guild owner-admins setting up their guild.',
  usageMessage:
    'A group of commands that help guild owner-admins setting up their guild.'
});
