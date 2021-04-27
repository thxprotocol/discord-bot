/* eslint-disable no-undef */
import { MessageEmbed } from 'discord.js';
import { sendMessage, afterAll, expect, test } from 'corde';

afterAll(async () => {
  await sendMessage('Test Passed!');
});

test('Ping command result should contain Pong', () => {
  const embed = new MessageEmbed({ description: `Pong!`, color: 3066993 });
  expect('ping').toReturn(embed);
});

test('Failed to update wallet if user input a invalid wallet address', () => {
  const embed = new MessageEmbed({
    description: `This wallet address is invalid`,
    color: 15158332
  });

  expect('wallet update 123123123').toReturn(embed);
});

test('Successfully to update wallet if user input a valid wallet address', () => {
  const embed = new MessageEmbed({
    description: `Successfully link your wallet`,
    color: 3066993
  });

  expect('wallet update 0x278Ff6d33826D906070eE938CDc9788003749e93').toReturn(
    embed
  );
});
