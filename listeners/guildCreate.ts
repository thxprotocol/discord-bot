import { Guild } from 'discord.js';
import GuildModel from 'models/guild';
import getDMChannelByUserId from 'utils/getDMChannelByUserId';
import { getPrefix } from 'utils/messages';

async function onGuildCreate(guild: Guild): Promise<void> {
  await GuildModel.create({ id: guild.id });
  const ownerChannel = await getDMChannelByUserId(guild.ownerID);
  await ownerChannel.send(
    `Welcome to THX Network, let start some basic stuff by command: \`${getPrefix()}setup\``
  );
}

export default onGuildCreate;
