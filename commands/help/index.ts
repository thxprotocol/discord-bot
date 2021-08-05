import { useSelector } from '@hooks';
import { CommandHandler } from 'types';
import embedGenerator from 'utils/embed';
import { listenerGenerator } from 'utils/command';
import ListenerType from 'constants/ListenerType';
import { commandMetaSelector } from 'core/store/selectors';
import Colors from 'constants/Colors';
import { renderParentCommand, renderSingleCommand } from './utils';
import permissionValidator from 'utils/command/permissionValidator';

const help: CommandHandler = async (message, params) => {
  const commandMeta = useSelector(commandMetaSelector);
  const embed = embedGenerator({});
  let embedContent = '';

  // Settings up embed
  embed.setColor(Colors.DARK_BLUE);
  embed.setFooter(message.client.user?.username);
  embed.setTimestamp(new Date());

  if (!params.length) {
    embed.setTitle('Command list');
    embedContent += '`*`: Have nested commands.\n\n';
    await Promise.all(
      Object.keys(commandMeta).map(async key => {
        const error = await permissionValidator({
          type: commandMeta[key].type,
          usageMessage: commandMeta[key].usageMessage,
          validationSchema: commandMeta[key].validationSchema,
          requiredPermissions: commandMeta[key].requiredPermissions,
          guildRequired: commandMeta[key].guildRequired,
          dmRequired: commandMeta[key].dmRequired,
          skipParamCheck: true,
          params,
          message
        });
        if (error) return;
        const isHaveChilds = !!Object.keys(commandMeta[key].childs).length;
        if (isHaveChilds) {
          embedContent += await renderParentCommand(
            commandMeta[key],
            params,
            message
          );
        } else {
          embedContent += renderSingleCommand(commandMeta[key]);
        }
      })
    );
    embed.setDescription(embedContent);
    return embed;
  } else {
    let currentDepth = commandMeta[params[0]];
    params.shift();
    params.forEach(key => {
      currentDepth = currentDepth.childs[key];
    });

    embedContent += `${currentDepth.usageMessage}\n\n`;
    if (Object.keys(currentDepth.childs).length) {
      embed.setTitle(currentDepth.name);
      embedContent += `**Nested commands**\n`;
      await Promise.all(
        Object.keys(currentDepth.childs).map(async key => {
          const isHaveChilds = !!Object.keys(currentDepth.childs[key].childs)
            .length;
          if (isHaveChilds) {
            embedContent += await renderParentCommand(
              currentDepth.childs[key],
              params,
              message
            );
          } else {
            embedContent += renderSingleCommand(currentDepth.childs[key]);
          }
        })
      );
    }

    embed.setDescription(embedContent);
    return embed;
  }

  // Main return
  return 'Test';
};

export default listenerGenerator({
  name: 'help',
  handler: help,
  type: ListenerType.GENERAL,
  helpMessage: 'Return a list of commands',
  usageMessage: 'Return a list of commands'
});
