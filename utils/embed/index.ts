import { MessageEmbed, MessageEmbedOptions } from 'discord.js';
import Colors from 'constants/Colors';

const embedGenerator = (
  data: MessageEmbed | MessageEmbedOptions
): MessageEmbed => {
  const embed = new MessageEmbed(data);
  return embed;
};

export const successEmbedGenerator = (
  data: MessageEmbed | MessageEmbedOptions
): MessageEmbed => {
  data.color = Colors.GREEN;
  return embedGenerator(data);
};

export const failedEmbedGenerator = (
  data: MessageEmbed | MessageEmbedOptions
): MessageEmbed => {
  data.color = Colors.RED;
  return embedGenerator(data);
};

export default embedGenerator;
