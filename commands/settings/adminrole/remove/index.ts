import * as Yup from 'yup';
import GuildModel from 'models/guild';
import { CommandHandler } from 'types';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { failedEmbedGenerator, successEmbedGenerator } from 'utils/embed';
import { extractRoleFromMention } from '../add/utils';
import { usageGenerate } from 'utils/messages';

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
  validationSchema: Yup.array().min(1),
  helpMessage: 'Remove a role from admin list',
  usageMessage: usageGenerate({
    name: 'remove',
    desc: 'Remove a role from admin list',
    path: 'settings adminrole remove',
    params: ['adminrole_id | tag'],
    example: 'settings adminrole remove 836152744158167051'
  })
});
