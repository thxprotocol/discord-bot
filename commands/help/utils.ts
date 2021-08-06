import { Message } from 'discord.js';
import ListenerType from 'constants/ListenerType';
// { ListenerTypeLabel } from 'constants/ListenerType';
import { CommandMetaState } from 'core/store/types';
import { CommandListenerMeta } from 'types';
import permissionValidator from 'utils/command/permissionValidator';

export const getCommandMetaByType = (type: ListenerType) => (
  commandMeta: CommandMetaState
) => {
  const filteredCommandMeta: CommandMetaState = {};

  Object.keys(commandMeta).forEach(key => {
    if (commandMeta[key].type === type) {
      filteredCommandMeta[key] = commandMeta[key];
    }
  });

  return filteredCommandMeta;
};

export const renderSingleCommand = (commandMeta: CommandListenerMeta) =>
  `**${commandMeta.name}**: ${commandMeta.helpMessage}\n`;

export const renderParentCommand = async (
  commandMeta: CommandListenerMeta,
  params: string[],
  message: Message
) => {
  let messages = '';

  await Promise.all(
    Object.keys(commandMeta.childs).map(async (name, index) => {
      const shouldAddCommas =
        index < Object.keys(commandMeta.childs).length - 1;

      const error = await permissionValidator({
        type: commandMeta.childs[name].type,
        usageMessage: commandMeta.childs[name].usageMessage,
        validationSchema: commandMeta.childs[name].validationSchema,
        requiredPermissions: commandMeta.childs[name].requiredPermissions,
        guildRequired: commandMeta.childs[name].guildRequired,
        dmRequired: commandMeta.childs[name].dmRequired,
        skipParamCheck: true,
        params,
        message
      });
      if (error) return;
      messages += shouldAddCommas
        ? `\`${commandMeta.childs[name].name}${
            Object.keys(commandMeta.childs[name].childs).length ? '*' : ''
          }\`,`
        : `\`${commandMeta.childs[name].name}${
            Object.keys(commandMeta.childs[name].childs).length ? '*' : ''
          }\`.`;
    })
  );

  return `**${commandMeta.name}**: ${messages}\n`;
};
