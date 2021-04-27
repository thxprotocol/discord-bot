import User from 'models/user';
import { PartialUser, User as DiscordUser } from 'discord.js';
import getDMChannelByUserId from 'utils/getDMChannelByUserId';
import embedGenerator from 'utils/embed';
import { getPrefix } from 'utils/messages';

const onGuildMemberAdd = async (discordUser: DiscordUser | PartialUser) => {
  const ownerChannel = await getDMChannelByUserId(discordUser.id);
  const prefix = getPrefix();

  const user = await User.findOne({ id: discordUser.id });
  if (user) return;

  const welcomeEmbed = embedGenerator({});
  welcomeEmbed.setTitle('Hey there! Glad to see you here!');
  welcomeEmbed.setDescription(
    `By setting up your wallet with command \`${prefix}wallet update <ADDRESS>\`, you will able to interact with me and rewarding orders for they contribute.`
  );
  ownerChannel.send(welcomeEmbed);
};

export default onGuildMemberAdd;
