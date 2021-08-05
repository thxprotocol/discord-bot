import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { usageGenerate } from 'utils/messages';

export default listenerGenerator({
  name: 'settings',
  queued: false,
  type: ListenerType.GUILD_ADMINS,
  helpMessage: 'A group of command that interact with guild settings',
  usageMessage: usageGenerate({
    name: 'settings',
    desc: 'A group of command that interact with guild settings',
    path: 'settings',
    childs: ['adminrole']
  })
});
