export function getReactionString(
  isNormalEmoji: RegExpExecArray | null,
  isDiscordEmoji: RegExpExecArray | null
) {
  const reaction =
    isNormalEmoji?.[0] || (isDiscordEmoji || []).filter(item => !!item)[1];
  return encodeURI(reaction);
}
