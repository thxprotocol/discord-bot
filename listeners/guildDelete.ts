import GuildModel from 'models/guild';
import ChannelModel from 'models/channel';
import ReactionModel from 'models/reaction';
import { Guild } from 'discord.js';

/**
 *
 * @param guild
 * Cleaning up guild data when the bot been kicked out the guild.
 */
async function onGuildDelete(guild: Guild): Promise<void> {
  const toDeleteGuild = await GuildModel.findOneAndDelete({ id: guild.id });
  if (!toDeleteGuild) return;
  const channels = await ChannelModel.find({ guild: toDeleteGuild });
  channels.forEach(async channel => {
    await ReactionModel.deleteMany({ channel: channel });
    await channel.remove();
  });
}

export default onGuildDelete;
