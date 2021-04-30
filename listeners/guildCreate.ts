import { Guild } from 'discord.js';
import GuildModel from 'models/guild';
import embedGenerator from 'utils/embed';
import getDMChannelByUserId from 'utils/getDMChannelByUserId';
import { getPrefix } from 'utils/messages';

async function onGuildCreate(guild: Guild): Promise<void> {
  await GuildModel.create({ id: guild.id });
  const ownerChannel = await getDMChannelByUserId(guild.ownerID);
  const prefix = getPrefix();

  const welcomeEmbed = embedGenerator({});

  welcomeEmbed.setTitle('Welcome to THX Network!');
  welcomeEmbed.setDescription(
    "We're created this bot to let Discord users easier to intergrate with our API\nBellow is few steps for you to quickstart with the bot:"
  );

  welcomeEmbed.addField(
    '**Step 1 - Setting up your Guild with Client ID and Client Secrect**',
    `By running the command \`${prefix}setup guild\`, the bot will ask you for your client ID and client secrect. Don't worry about someone can see your credential, the bot will hide them instanly at the time you send it.`
  );

  welcomeEmbed.addField(
    '**Step 2 - Linking Channels with a Asset Pools**',
    `By running the command \`${prefix}setup assetpool\` In certain channel, the bot will ask for your contract address. After that everything should be fine.`
  );

  welcomeEmbed.addField(
    '**Step 3 - Adding Emoji**',
    `By running the command \`${prefix}emoji add\` In certain channel, the bot will ask for the emoji you want to use to reward others, ammount and delay of reward.`
  );

  welcomeEmbed.addField('------------------------------', '\u200B');
  welcomeEmbed.addField(
    '**Inviting orther people to help you**',
    `You able to invite other peoples that have certant roles to help you manage your server, just use this command: \`${prefix}settings adminroles add/remove <role_that_you_want_the_bot_will_see_as_admin>\` `
  );

  await ownerChannel.send(welcomeEmbed);
}

export default onGuildCreate;
