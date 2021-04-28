import { CommandHandler } from 'types';
import GuildModel from 'models/guild';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { extractRoleFromMention } from './utils';

const add: CommandHandler = async (message, params) => {
  const roleId = extractRoleFromMention(params[0]);

  const guild = await GuildModel.findOne({
    id: message.guild?.id
  });

  // TO-DO: Handle re-init guild case;
  const isAlreadyContain = guild?.admin_roles.includes(roleId);

  if (isAlreadyContain) {
    return failedEmbedGenerator({
      description: 'This role already known as an Admin role'
    });
  }

  guild?.admin_roles.push(roleId);
  guild?.save();

  return successEmbedGenerator({
    description: `Successfully added new role to Admin role list!`
  });
};

export default listenerGenerator({
  name: 'add',
  queued: true,
  handler: add,
  type: ListenerType.GENERAL,
  helpMessage: 'This command return a pong when you call it (Developer only)',
  usageMessage: 'This command return a pong when you call it (Developer only)'
});
