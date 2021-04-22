enum ListenerType {
  GENERAL = 'GENERAL',
  BOT_OWNER = 'BOT_OWNER',
  GUILD_OWNER = 'GUILD_OWNER',
  GUILD_ADMINS = 'GUILD_ADMINS'
}

/////////////////////////////

export const ListenerTypeLabel = {
  [ListenerType.GUILD_OWNER]: 'Guild owner only access command',
  [ListenerType.GUILD_ADMINS]: 'Guild admins only access command',
  [ListenerType.BOT_OWNER]: 'Owner only access Commands',
  [ListenerType.GENERAL]: 'General Commands'
};

export default ListenerType;
