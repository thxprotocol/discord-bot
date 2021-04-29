import _ from 'lodash';
import GuildModel from 'models/guild';
import { useDispatch, useSelector } from '@hooks';
import ListenerType from 'constants/ListenerType';
import {
  DEFAULT_DEVELOPER_ERROR_MESSAGE,
  DEFAULT_DM_REQUIRED_MESSAGE,
  DEFAULT_EXECUTION_ERROR_MESSAGE,
  DEFAULT_GUILD_REQUIRED_MESSAGE,
  DEFAULT_PERMISSIONS_ERROR
} from 'constants/messages';
import { addCommandMeta, addCooldown } from 'core/store/actions';
import { ownerIdSelector, selectCooldownById } from 'core/store/selectors';
import { MessageEmbed, PermissionString } from 'discord.js';
import { CommandListener } from 'types';
import { failedEmbedGenerator } from 'utils/embed';
import inLast from 'utils/inLast';
import { getStaticPath, getLogger } from '..';

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
        depth,
        childs: {}
      })
    );
  })();
  // Inner scope
  return async (message, params) => {
    // Values
    const userFlags = message.guild?.members.cache.get(message.author.id)
      ?.permissions;

    // Permission checks
    const paramsValid = validationSchema?.isValidSync(params);
    const botOwner = useSelector(ownerIdSelector);
    const isBotOwner = botOwner === message.author.id;
    const isProduction = process.env.NODE_ENV === 'production';
    const isRequiredFlags = requiredPermissions.length > 0 && !dmRequired;
    const isFromCorde = isProduction
      ? false
      : message.author.id === process.env.CORDE_BOT_ID;
    const isGuildOwner = message.author.id === message.guild?.ownerID;
    const isPermissionValid = isRequiredFlags
      ? !!(requiredPermissions as PermissionString[]).filter(requiredFlag =>
          userFlags?.toArray().find(userFlag => requiredFlag === userFlag)
        ).length
      : true;

    // Should apply permission checks
    const shouldApplyParamsCheck = !!validationSchema;
    const shouldApplyPermissionCheck = !!requiredPermissions.length;

    // Check Params
    if (shouldApplyParamsCheck) {
      if (!paramsValid) {
        if (usageMessage instanceof MessageEmbed) {
          return usageMessage;
        } else {
          return failedEmbedGenerator({
            description: usageMessage
          });
        }
      }
    }

    // @ Only check other case if
    // it not the bot owner

    if (dmRequired) {
      if (message?.guild) {
        return failedEmbedGenerator({
          description: DEFAULT_DM_REQUIRED_MESSAGE
        });
      }
    }

    if (guildRequired) {
      if (!message?.guild) {
        return failedEmbedGenerator({
          description: DEFAULT_GUILD_REQUIRED_MESSAGE
        });
      }

      // @ Bybass all further check if is guild owner
      // @ Or Corde test, but disable in Production enviroment
      switch (type as ListenerType) {
        case ListenerType.BOT_OWNER: {
          if (!isBotOwner) {
            return failedEmbedGenerator({
              description: DEFAULT_DEVELOPER_ERROR_MESSAGE
            });
          }
          break;
        }
        //
        case ListenerType.GUILD_OWNER: {
          if (!isGuildOwner && !isFromCorde) {
            return failedEmbedGenerator({
              description: 'Only guild owner can do this'
            });
          }
          break;
        }
        //
        case ListenerType.GUILD_ADMINS: {
          // Move this to here to save some queries
          const guildAdminRoleIds = await GuildModel.findOne({
            id: message.guild?.id
          });
          const guildAdminRoles = guildAdminRoleIds?.admin_roles;
          const userRoles = message.guild?.members.cache
            .get(message.author.id)
            ?.roles.cache.array()
            .map(role => role.id);
          const isGuildAdmin = _.intersectionWith(
            userRoles,
            guildAdminRoles || [],
            _.isEqual
          ).length;
          if (!isGuildOwner && !isGuildAdmin && !isFromCorde) {
            return failedEmbedGenerator({
              description: 'Only guild owner or guild admin can do this'
            });
          }
          break;
        }
        //
        case ListenerType.GENERAL: {
          // Move this to here to save some queries
          if (
            !isPermissionValid &&
            shouldApplyPermissionCheck &&
            !isFromCorde
          ) {
            return failedEmbedGenerator({
              description: DEFAULT_PERMISSIONS_ERROR
            });
          }
        }
        //
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
