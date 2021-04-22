import GuildModel from 'models/guild';
import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { extractRoleFromMention } from '../add/utils';

const remove: CommandHandler = async (message, params) => {
  const roleId = extractRoleFromMention(params[0]);

  const guild = await GuildModel.findOne({
    id: message.guild?.id
  });

  // TO-DO: Handle re-init guild case;
  const isAlreadyContain = guild?.admin_roles.includes(roleId);

  if (!isAlreadyContain) {
    return failedEmbedGenerator({
      description: 'This role is not in admin role list'
    });
  }

  guild?.admin_roles.pull(roleId);
  guild?.save();

  return successEmbedGenerator({
    description: `Successfully removed this role to Admin role list!`
  });
};

export default listenerGenerator({
  name: 'remove',
  queued: true,
  handler: remove,
  type: ListenerType.GENERAL,
  helpMessage: 'This command return a pong when you call it (Developer only)',
  usageMessage: 'This command return a pong when you call it (Developer only)'
});
