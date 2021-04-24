import { createSelector } from 'reselect';
import { ApplicationRootState } from './types';

export const rootSelector = (state: ApplicationRootState) => state;

export const metadataSelector = createSelector(
  rootSelector,
  state => state.meta
);

export const ownerIdSelector = createSelector(
  metadataSelector,
  state => state.ownerId
);

export const commandMetaSelector = createSelector(
  metadataSelector,
  state => state.commands
);

export const selectCommandByName = (commandName: string) =>
  createSelector(commandMetaSelector, state => state[commandName]);

export const cooldownSelector = createSelector(
  rootSelector,
  state => state.cooldown
);

export const selectCooldownById = (userId: string) =>
  createSelector(cooldownSelector, state => state[userId]);

export const accessTokenSelector = createSelector(
  rootSelector,
  state => state.accessToken
);

export const selectAccessToken = (clientId: string, clientToken: string) =>
  createSelector(accessTokenSelector, state =>
    state[clientId]?.clientToken === clientToken ? state.token : undefined
  );
