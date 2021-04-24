export function getReactionString(
  isNormalEmoji: RegExpExecArray | null,
  isDiscordEmoji: RegExpExecArray | null
) {
  return isNormalEmoji?.[0] || (isDiscordEmoji || []).filter(item => !!item)[1];
}
