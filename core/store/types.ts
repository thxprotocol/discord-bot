import CommandListenerMeta from 'types/CommandListenerMeta';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export interface AccessToken {
  token: string;
  expireIn: number;
  clientToken: string;
}

export interface Member {
  [memberId: string]: string;
}

export interface Reaction {
  [reactionId: string]: string;
}
export interface Channel {
  poolAddress: string;
  reactions: Reaction;
  members: Member;
}

/**
 * States
 */

export type ApplicationActions = ActionType<typeof actions>;

export interface UserCooldownState {
  [command: string]: number;
}

export interface CooldownState {
  [userId: string]: UserCooldownState;
}

export interface CommandMetaState {
  [key: string]: CommandListenerMeta;
}

export interface MetaDataState {
  commands: CommandMetaState;
  defaultPrefix: string;
  ownerId: string;
}

export interface AccessTokenState {
  [clientId: string]: AccessToken;
}

export interface ChannelState {
  [channelId: string]: Channel;
}

export interface ApplicationRootState {
  meta: MetaDataState;
  cooldown: CooldownState;
  accessToken: AccessTokenState;
  channels: ChannelState;
}
