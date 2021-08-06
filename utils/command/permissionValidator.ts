import _ from 'lodash';
import { Message, MessageEmbed, PermissionString } from 'discord.js';
import GuildModel from 'models/guild';
import { useSelector } from '@hooks';
import { CommandListenerProps } from 'types/CommandListener';
import { ownerIdSelector } from 'core/store/selectors';
import {
  DEFAULT_DEVELOPER_ERROR_MESSAGE,
  DEFAULT_DM_REQUIRED_MESSAGE,
  DEFAULT_GUILD_REQUIRED_MESSAGE,
  DEFAULT_PERMISSIONS_ERROR
} from 'constants/messages';
import ListenerType from 'constants/ListenerType';

type Props = Pick<
  CommandListenerProps,
  | 'type'
  | 'usageMessage'
  | 'validationSchema'
  | 'requiredPermissions'
  | 'guildRequired'
  | 'dmRequired'
> & {
  message: Message;
  params: string[];
  skipParamCheck?: boolean;
};

const permissionValidator = async ({
  type,
  usageMessage,
  validationSchema,
  requiredPermissions = [],
  skipParamCheck = false,
  guildRequired = true,
  dmRequired = false,
  message,
  params
}: Props): Promise<string | MessageEmbed | undefined> => {
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
  const shouldApplyParamsCheck = !!validationSchema && !skipParamCheck;
  const shouldApplyPermissionCheck = !!requiredPermissions.length;

  // Check Params
  if (shouldApplyParamsCheck) {
    if (!paramsValid) {
      if (usageMessage instanceof MessageEmbed) {
        return usageMessage;
      } else {
        return usageMessage;
      }
    }
  }

  // @ Only check other case if
  // it not the bot owner

  if (dmRequired) {
    if (message?.guild) {
      return DEFAULT_DM_REQUIRED_MESSAGE;
    }
  }

  if (guildRequired) {
    if (!message?.guild) {
      return DEFAULT_GUILD_REQUIRED_MESSAGE;
    }

    // @ Bybass all further check if is guild owner
    // @ Or Corde test, but disable in Production enviroment
    switch (type as ListenerType) {
      case ListenerType.BOT_OWNER: {
        if (!isBotOwner) {
          return DEFAULT_DEVELOPER_ERROR_MESSAGE;
        }
        break;
      }
      //
      case ListenerType.GUILD_OWNER: {
        if (!isGuildOwner && !isFromCorde) {
          return 'Only guild owner can do this';
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
          return 'Only guild owner or guild admin can do this';
        }
        break;
      }
      //
      case ListenerType.GENERAL: {
        // Move this to here to save some queries
        if (!isPermissionValid && shouldApplyPermissionCheck && !isFromCorde) {
          return DEFAULT_PERMISSIONS_ERROR;
        }
      }
      //
    }
  }

  return undefined;
};

export default permissionValidator;
