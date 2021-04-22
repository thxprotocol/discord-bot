export const extractRoleFromMention = (message: string) =>
  message.replace('<@&', '>');
