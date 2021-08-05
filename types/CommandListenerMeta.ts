import * as Yup from 'yup';
import { MessageEmbed } from 'discord.js';
import ListenerType from 'constants/ListenerType';
import PermissionFlag from 'constants/PermissionFlag';

interface CommandListenerMeta {
  /** Command Name. */
  name: string;
  /** Command Handler Type. */
  type?: ListenerType;
  /** Return message for help command */
  helpMessage: string;
  /** Return message when wrong param input. */
  usageMessage: string | MessageEmbed;
  /** Time that user need to wait before can re-use this command */
  cooldown?: number;
  /** Should run this command in a queue or not */
  queued?: boolean;
  /** Show how depth of this command */
  depth?: number;
  /** An schema that check input params is correct or not. */
  validationSchema?: Yup.AnySchema;
  /** Required permission for member in a guide to use this command. */
  requiredPermissions?: PermissionFlag[];
  /** Required roles for member in a guide to use this command. */
  requiredRoles?: PermissionFlag[];
  /** Is this command only useable in a guild */
  guildRequired?: boolean;
  /** Is this command only useable in a DM */
  dmRequired?: boolean;
  /* Child of command */
  childs: {
    [key: string]: CommandListenerMeta;
  };
}

export default CommandListenerMeta;
