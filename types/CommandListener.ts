import { CommandHandler } from 'types';
import CommandListenerMeta from './CommandListenerMeta';

export interface CommandListenerProps
  extends Omit<CommandListenerMeta, 'childs'>,
    Partial<Pick<CommandListenerMeta, 'childs'>> {
  /** Command Handler if pass all checks. */
  handler?: CommandHandler;
}

type CommandListener = (options: CommandListenerProps) => CommandHandler;

export default CommandListener;
