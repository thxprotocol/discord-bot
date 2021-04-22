import { Guild } from 'discord.js';
import GuildModel from 'models/guild';

async function onGuildCreate(guild: Guild): Promise<void> {
  await GuildModel.create({ id: guild.id });
}

export default onGuildCreate;
