enum ListenerType {
  GENERAL = 'GENERAL',
  DEVELOPER = 'DEVELOPER',
  GUILD_OWNER = 'GUILD_OWNER',
  GUILD_ADMINS = 'GUILD_ADMINS'
}

/////////////////////////////

export const ListenerTypeLabel = {
  [ListenerType.GUILD_OWNER]: 'Guild owner only access command',
  [ListenerType.GUILD_ADMINS]: 'Guild admins only access command',
  [ListenerType.DEVELOPER]: 'Developer only access Commands',
  [ListenerType.GENERAL]: 'General Commands'
};

export default ListenerType;
