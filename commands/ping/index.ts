import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { successEmbedGenerator } from 'utils/embed';
import { usageGenerate } from 'utils/messages';

const ping: CommandHandler = async () => {
  return successEmbedGenerator({
    description: `Pong!`
  });
};

export default listenerGenerator({
  name: 'ping',
  cooldown: 10,
  queued: false,
  handler: ping,
  type: ListenerType.GENERAL,
  helpMessage: 'This command return a pong',
  usageMessage: usageGenerate({
    name: 'ping',
    desc: 'This command return a pong'
  })
});
