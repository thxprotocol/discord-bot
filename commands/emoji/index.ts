import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { usageGenerate } from 'utils/messages';

export default listenerGenerator({
  queued: true,
  name: 'emoji',
  type: ListenerType.GUILD_ADMINS,
  helpMessage: 'A group of commands used for configuring reaction emoji.',
  usageMessage: usageGenerate({
    name: 'emoji',
    desc: 'A group of commands used for configuring reaction emoji.',
    path: 'emoji',
    childs: ['add']
  })
});
