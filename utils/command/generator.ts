import _ from 'lodash';
import { useDispatch, useSelector } from '@hooks';
import { DEFAULT_EXECUTION_ERROR_MESSAGE } from 'constants/messages';
import { addCommandMeta, addCooldown } from 'core/store/actions';
import { selectCooldownById } from 'core/store/selectors';
import { MessageEmbed } from 'discord.js';
import { CommandListener } from 'types';
import { failedEmbedGenerator } from 'utils/embed';
import inLast from 'utils/inLast';
import { getStaticPath, getLogger } from '..';
import permissionValidator from './permissionValidator';

const getCurrentLocation = () => {
  const e = new Error();
  const regex = /\((.*):(\d+):(\d+)\)$/;
  if (!e.stack) return '';
  const match = regex.exec(e.stack.split('\n')[4]);
  return match?.[1] || '';
};

const generator: CommandListener = ({
  name,
  type,
  handler,
  helpMessage,
  usageMessage,
  validationSchema,
  requiredPermissions = [],
  guildRequired = true,
  dmRequired = false,
  cooldown = 0
}) => {
  // This will make sure vars inside this anon
  // function is clearable by Garbage collector
  (function () {
    // let parent = undefined;
    const commandDepthArray = getCurrentLocation()
      .replace(getStaticPath('commands'), '')
      .replace('/index.ts', '')
      .slice(1, getCurrentLocation().length)
      ?.split('/');
    if (commandDepthArray?.length > 1) {
      // parent =
      //   commandDepthArray[
      //     commandDepthArray.findIndex(item => item === name) - 1
      //   ];
    }

    const itemIndex = commandDepthArray.findIndex(item => item === name);
    const depthArray = commandDepthArray.splice(0, itemIndex);

    const dispatch = useDispatch();
    const depth = commandDepthArray.length;
    dispatch(
      addCommandMeta(depthArray, {
        name,
        type,
        helpMessage,
        usageMessage,
        validationSchema,
        requiredPermissions,
        guildRequired,
        dmRequired,
        depth,
        childs: {}
      })
    );
  })();
  // Inner scope
  return async (message, params) => {
    // Values
    const isProduction = process.env.NODE_ENV === 'production';
    const isFromCorde = isProduction;

    const error = await permissionValidator({
      type,
      usageMessage,
      validationSchema,
      requiredPermissions,
      guildRequired,
      dmRequired,
      params,
      message
    });

    if (error) {
      if (error instanceof MessageEmbed) {
        return error;
      } else {
        return failedEmbedGenerator({
          description: error
        });
      }
    }

    // After pass all permission check
    // Quick return usageMessage or
    // there no command handler
    if (!handler) {
      if (usageMessage instanceof MessageEmbed) {
        return usageMessage;
      } else {
        return failedEmbedGenerator({
          description: usageMessage
        });
      }
    } else {
      // Return timeout if command
      // is used recently.
      const cooldownChecker = inLast(cooldown);
      const userCooldown = useSelector(selectCooldownById(message.author.id));
      const lastTimeCommandUsed = userCooldown?.[name];
      if (
        !isFromCorde &&
        lastTimeCommandUsed &&
        cooldownChecker(lastTimeCommandUsed)
      ) {
        //////////////////////
        const timeRemain = (
          cooldown -
          (message.createdTimestamp - lastTimeCommandUsed) / 1000
        ).toFixed(2);
        //////////////////////
        return failedEmbedGenerator({
          description: `You need **${timeRemain}s** before can use this command again.`
        });
      }

      // Main return
      try {
        const dispatch = useDispatch();
        const result = await handler(message, params);
        dispatch(addCooldown(message.author.id, name, new Date().getTime()));
        return result;
      } catch (error) {
        const logger = getLogger();
        logger.error(error.message);
        return failedEmbedGenerator({
          description: DEFAULT_EXECUTION_ERROR_MESSAGE
        });
      }
    }
  };
};

export default generator;
