import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { usageGenerate } from 'utils/messages';

export default listenerGenerator({
  name: 'adminrole',
  cooldown: 10,
  queued: false,
  type: ListenerType.GENERAL,
  helpMessage:
    'A group of command that interact with guild admin roles settings',
  usageMessage: usageGenerate({
    name: 'adminrole',
    desc: 'A group of command that interact with guild admin roles settings',
    path: 'settings adminrole',
    childs: ['add', 'remove']
  })
});
