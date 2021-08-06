import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { usageGenerate } from 'utils/messages';

export default listenerGenerator({
  name: 'setup',
  queued: true,
  type: ListenerType.GUILD_ADMINS,
  helpMessage:
    'A group of commands that help guild owner-admins setting up their guild.',
  usageMessage: usageGenerate({
    name: 'setup',
    desc:
      'A group of commands that help guild owner-admins setting up their guild.',
    path: 'setup',
    childs: ['assetpool', 'guild']
  })
});
