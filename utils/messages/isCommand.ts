import getPrefix from './getPrefix';

const isCommand = (message: string): boolean => {
  const prefix = getPrefix();
  if (prefix === '') return true; // Edge cases

  return message.startsWith(prefix);
};

export default isCommand;
